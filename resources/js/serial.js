async function serial_close() {
    setStatus('warning', 'Closing serial port');
    main_port_quit = true;
    if (main_port) {
        if (main_reader != null) { main_reader.cancel(); }
        await main_serialReaderPromise;
    }
    setStatus('OK', null);
}





var PROGRAM_NAME = 'ASLWebTerm';
var PROGRAM_VERSION = '2.0';
var PROGRAM_DATE = '26-Aug-2022';
var PID_OEM = 0x0100;
var MAIN_SUPPORT_SOFTWARE_URL = "download.html#software";
class SerialSettings {
    constructor() {
        this.EOL_CR = 0;
        this.EOL_LF = 1;
        this.EOL_CRLF = 2;
        this.comport = "COM";
        this.baud = 115200;
        this.parity = 'none';
        this.databits = 8;
        this.stopbits = 1;
        this.displayEoln = this.EOL_CR;
        this.tabSize = 8;
        this.keyEnter = this.EOL_CRLF;
    }
    update() {
        this.baud = parseInt(document.getElementById("baud").value);
        this.parity = document.getElementById("parity").value;
        this.datebits = parseInt(document.getElementById("databits").value);
        this.stopbits = parseInt(document.getElementById("stopbits").value);
        this.tabSize = parseInt(document.getElementById("display-tabsize").value);
        if (this.tabsize < 2) this.tabsize = 2;
        let eol = document.getElementById("display-eoln").value;
        this.displayEoln = this.getEolCode(eol);
        eol = document.getElementById("keyboard-enter").value;
        this.keyEnter = this.getEolCode(eol);
    }
    getBaud() {
        return (this.baud);
    }
    getParity() { return (this.parity); }
    getDataBits() { return (this.databits); }
    getStopBits() {
        return (this.stopbits);
    }
    getEolCode(str) {
        switch (str) {
            case 'CR':
                return (this.EOL_CR);
                break;
            case 'LF':
                return (this.EOL_LF);
                break;
        }
        return (this.EOL_CRLF);
    }
    toString() {
        return (this.comport + ':' + this.baud + ',' + this.parity.charAt(0) + ',' + this.databits + ',' + this.stopbits);
    }
}
class ListNode {
    constructor(text) {
        this.next = null;
        this.prev = null;
        this.text = text;
    }
}
class LinkedList {
    constructor() { this.clear(); }
    clear() {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }
    getCount() { return (this.count); }
    append(node) {
        if (this.head == null) {
            this.head = node;
            this.tail = node;
            node.next = null;
            node.prev = null;
        } else {
            this.tail.next = node;
            node.next = null;
            node.prev = this.tail;
            this.tail = node;
        }
        this.count++;
    }
    removeFirst() {
        let node = this.head;
        if (node != null) {
            if (this.tail == node) {
                this.head = null;
                this.tail = null;
            } else {
                let next = node.next;
                this.head = next;
                next.prev = null;
            }
            node.next = null;
            node.prev = null;
            this.count--;
        }
        return (node);
    }
    remove(node) {
        if (this.head == this.tail) {
            this.head = null;
            this.tail = null;
        } else {
            let prev = node.prev;
            let next = node.next;
            if (prev == null) {
                this.head = next;
                next.prev = null;
            } else if (next == null) {
                this.tail = prev;
                prev.next = null;
            } else {
                prev.next = next;
                next.prev = prev;
            }
        }
        node.next = null;
        node.prev = null;
        this.count--;
    }
}
class TxBufferNode extends ListNode {
    constructor(text) {
        super(text);
        this.index = 0;
        this.size = text.length;
    }
}
class TxBufferList extends LinkedList {
    constructor() {
        super();
        this.size = 0;
        this.MINSIZE = 512;
    }
    bufferClear() {
        this.clear();
        this.size = 0;
    }
    isEmpty() { return (this.size == 0); }
    getSize() {
        return (this.size);
    }
    add(text) {
        this.size += text.length;
        if ((txBuffer.getCount() <= 1) || (text.length > txBuffer.MINSIZE)) {
            this.append(new TxBufferNode(text));
            return;
        }
        let node = txBuffer.tail;
        if (node.size < txBuffer.MINSIZE) {
            node.text += text;
            node.size += text.length;
            return;
        }
        this.append(new TxBufferNode(text));
    }
    getNext() {
        let bufNode = this.head;
        if (bufNode != null) {
            let text = bufNode.text;
            if ((bufNode.size - bufNode.index) <= txBuffer.MINSIZE) {
                if (bufNode.index != 0) {
                    text = text.substring(bufNode.index);
                }
                this.size -= text.length;
                this.removeFirst();
                return (text);
            }
            text = text.substring(bufNode.index, bufNode.index + txBuffer.MINSIZE);
            bufNode.index += txBuffer.MINSIZE;
            this.size -= txBuffer.MINSIZE;
            return (text);
        }
        return (null);
    }
}
class TermLineNode extends ListNode {
    constructor(text) {
        super(text);
        this.cpos = 0;
        this.size = 0;
        this.total = 0;
    }
}
class TermLineList extends LinkedList {
    constructor(maxLines = 1024) {
        super();
        this.maxLines = maxLines;
        this.termClear();
    }
    termClear() {
        this.clear();
        var node = new TermLineNode('');
        this.append(node);
        this.total = 0;
    }
    appendTermChar(ch) {
        let node = this.tail;
        let code = ch.charCodeAt(0);
        if (code < 32) {
            if (code == 9) {
                let cp = (node.cpos + serialStgs.tabSize) & ~(serialStgs.tabSize - 1);
                while (node.cpos < cp) {
                    node.cpos++;
                    while (node.cpos > node.size) {
                        node.text += ' ';
                        node.size++;
                    }
                }
                return;
            }
            if (code == 13) {
                node.cpos = 0;
                code = 10;
                if (serialStgs.displayEoln != serialStgs.EOL_CRLF) { return; }
            }
            if (code == 10) {
                let str = node.text;
                if (str.charAt(0) == 'A') { productDetect(str); }
                node = new TermLineNode('');
                this.append(node);
                this.total++;
                if (this.getCount() > this.maxLines) { this.removeFirst(); }
                return;
            }
            ch = String.fromCharCode(16);
        } else {
            if ((code >= 128) && (code < 160)) ch = String.fromCharCode(16);
        }
        let index = node.cpos;
        if (index < node.size) {
            let str = node.text;
            node.text = str.substring(0, index) + ch + str.substring(index + 1);
            node.cpos++;
            return;
        }
        node.text = node.text + ch;
        node.size++;
        node.cpos = node.size;
    }
    appendTermText(text) {
        let len = text.length;
        for (let i = 0; i < len; i++) { this.appendTermChar(text.charAt(i)); }
    }
    getTermText(lines = 10000) {
        text = '';
        var node = this.tail;
        if (node != null) {
            var text = node.text;
            lines--;
            while (lines > 0) {
                node = node.prev;
                if (node == null) { break; }
                text = node.text + '\n' + text;
                lines--;
            }
        }
        return (text);
    }
    getLineCount() { return (this.count - 1); }
    getLineTotal() { return (this.total); }
}

function aslwebterm_init() {
    let title = PROGRAM_NAME + ' V' + PROGRAM_VERSION + ' &nbsp; ' + PROGRAM_DATE;
    document.getElementById("about-title").innerHTML = title;
    termInput = document.getElementById("term-input");
    termInput.onBlur = function() { termInput.focus(); };
    termInput.addEventListener('keydown', keyCharIn);
    sendInput = document.getElementById('send-file');
    sendInput.addEventListener('change', sendSingleFile, false);
    sendInput.onclick = function() { this.value = null; };
    main_aslConfig.clear();
    setProduct(main_aslConfig);
    setTermState('disconnected');
    setPanel(null);
    statusline_lines = document.getElementById("statusline-lines");
    main_menu_init();
}

function setPanel(name) {
    let isStgs = (name == "settings");
    let isAbout = (name == "about");
    let isHelp = (name == "help");
    if (!('serial' in navigator)) {
        document.getElementById('webapidiv').style.display = "block";
        isStgs = false;
    } else {
        if (main_termState != 'connected') { isStgs = true; }
        if (name == 'terminal') { termInput.focus(); }
    }
    div = document.getElementById("aboutdiv");
    div.style.display = isAbout ? "block" : "none";
    div = document.getElementById("settingsdiv");
    div.style.display = isStgs ? "block" : "none";
    div = document.getElementById("helpdiv");
    div.style.display = isHelp ? "block" : "none";
}

function do_clickProductImage() {
    if (main_aslConfig.isValid()) { button_userguide(); }
}

function button_userguide() {
    if (main_aslConfig.isValid()) {
        do_processUserGuide(main_aslConfig,
            main_aslVersion, main_aslOptions);
    }
}

function termInputUpdate() {
    termInput.value = termLines.getTermText(25);
    str = "Lines=" + termLines.getLineTotal() + ",&nbsp;Buffered=" + termLines.getLineCount();
    setInnerHTML(statusline_lines, str);
}

function setStatus(stype, smessage) {
    elem = document.getElementById("statusline");
    if (stype == 'OK') {
        setInnerHTML(elem, "Status: OK");
        elem.style.backgroundColor = '#c5ffc5';
        return;
    }
    if (stype == 'info') {
        setInnerHTML(elem, smessage);
        elem.style.backgroundColor = '#c5ffc5';
        return;
    }
    if (stype == 'error') {
        setInnerHTML(elem, "Error: " + smessage);
        elem.style.backgroundColor = '#ffc5c5';
        return;
    }
    if (stype == 'warning') {
        setInnerHTML(elem, "Status: " + smessage);
        elem.style.backgroundColor = '#ffffc5';
        return;
    }
}

function setMainProgress() {
    var div;
    let disc_button = document.getElementById("term-button-disconnect");
    if (txBuffer.isEmpty()) {
        if (main_progress) {
            div = document.getElementById("statusline-progress");
            div.style.display = "none";
            div = document.getElementById("statusline-lines");
            div.style.display = "block";
            progress_max = 0;
            disc_button.disabled = false;
            main_progress = false;
        }
        return;
    }
    if (!main_progress) {
        div = document.getElementById("statusline-lines");
        div.style.display = "none";
        div = document.getElementById("statusline-progress");
        div.style.display = "table";
        progress_max = txBuffer.MINSIZE;
        disc_button.disabled = true;
        main_progress = true;
    }
    let size = txBuffer.getSize();
    if (size > progress_max) {
        progress_max = size;
    }
    let sofar = progress_max - size;
    let progdiv = document.getElementById("statusline-progressbar");
    progdiv.max = progress_max;
    progdiv.value = sofar;
}
async function term_tx(data) {
    if (txBuffer.isEmpty()) {
        if (data.length <= txBuffer.MINSIZE) { main_serialWriterPromise = await serialWrite(data); return; }
    }
    txBuffer.add(data);
    main_serialWriterPromise = await serialWrite(txBuffer.getNext());
}
async function keyCharIn(event) {
    event.preventDefault();
    ch = event.key;
    if (ch.length > 1) {
        switch (ch) {
            case 'Del':
                await term_tx(String.fromCharCode(127));
                break;
            case 'Backspace':
                await term_tx(String.fromCharCode(8));
                break;
            case 'Tab':
                await term_tx(String.fromCharCode(9));
                break;
            case 'Escape':
                await term_tx(String.fromCharCode(27));
                break;
            case 'Enter':
                if (serialStgs.keyEnter == serialStgs.EOL_CR) {
                    await term_tx(String.fromCharCode(13));
                    return;
                }
                if (serialStgs.keyEnter == serialStgs.EOL_LF) { await term_tx(String.fromCharCode(10)); return; }
                if (serialStgs.keyEnter == serialStgs.EOL_CRLF) {
                    let str = String.fromCharCode(13) + String.fromCharCode(10);
                    await term_tx(str);
                    return;
                }
                break;
        }
    } else {
        if (event.ctrlKey) {
            if ((ch >= 'a') && (ch <= 'z')) {
                var chr = String.fromCharCode(ch.charCodeAt(0) - 96);
                await term_tx(chr);
            }
        } else {
            await term_tx(ch);
        }
    }
}

function setTermState(newState) {
    if (newState != main_termState) {
        main_termState = newState;
        let ta = document.getElementsByTagName('textarea')[0];
        let scom = document.getElementById("statusline-com");
        let but = document.getElementById("stgs-connect");
        if (newState == 'connected') {
            ta.style.setProperty('--term-border-color', 'orange');
            ta.style.setProperty('--term-border-color-focus', 'lightgreen');
            setInnerHTML(scom, serialStgs.toString());
            setInnerHTML(but, "Disconnect");
        } else {
            ta.style.setProperty('--term-border-color', 'red');
            ta.style.setProperty('--term-border-color-focus', 'red');
            setInnerHTML(scom, "Disconnected");
            setInnerHTML(but, "Connect");
        }
    }
}

function button_webapi_copy(id) {
    let td = document.getElementById(id);
    let text = td.innerHTML;
    var dummy = document.createElement("input");
    dummy.value = text;
    document.body.appendChild(dummy);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    alert(text + "\n\nAbove URL Copied to the system clipbpoard\n\nPaste this value into your browser web address");
}

function button_termclick() {
    setStatus('OK', null);
    setPanel('terminal');
}

function button_terminal() {
    setStatus('OK', null);
    setPanel('terminal');
}

function button_settings() {
    setStatus('OK', null);
    div = document.getElementById("settingsdiv");
    if (div.style.display == "block") { setPanel('terminal'); } else { setPanel('settings'); }
}

function button_about() {
    setStatus('OK', null);
    div = document.getElementById("aboutdiv");
    if (div.style.display == "block") {
        setPanel('terminal');
    } else { setPanel('about'); }
}

function button_help() {
    setStatus('OK', null);
    div = document.getElementById("helpdiv");
    if (div.style.display == "block") { setPanel('terminal'); } else { setPanel('help'); }
}
async function button_stgs_connect() {
    let newState = 'disconnected';
    if (main_termState == 'connected') {
        await serial_close();
        txBuffer.bufferClear();
        setMainProgress();
    } else { await serial_open(); if (main_port != null) { newState = 'connected'; } }
    setTermState(newState);
    setPanel('terminal');
}

function button_stgs_defaults() {
    let sel = document.getElementById("baud");
    sel.value = "115200";
    sel = document.getElementById("parity");
    sel.value = "none";
    sel = document.getElementById("databits");
    sel.value = "8";
    sel = document.getElementById("stopbits");
    sel.value = "1";
    sel = document.getElementById("display-eoln");
    sel.value = "CR";
    sel = document.getElementById("display-tabsize");
    sel.value = "8";
    sel = document.getElementById("keyboard-enter");
    sel.value = "CRLF";
    serialStgs.update();
    termInput.focus();
}

function button_progress_cancel() {
    txBuffer.bufferClear();
    setMainProgress();
    termInput.focus();
}
async function button_term_disconnect() {
    await serial_close();
    txBuffer.bufferClear();
    setMainProgress();
    setTermState('disconnected');
    setPanel('terminal');
}

function button_term_clear() {
    setStatus('OK', null);
    termLines.termClear();
    main_aslConfig.clear();
    setProduct(main_aslConfig);
    termInput.value = '';
    termInput.focus();
}

function button_term_snapshot() {
    let text = termLines.getTermText();
    if (text != '') {
        let title = PROGRAM_NAME + ' V' + PROGRAM_VERSION + ' Terminal Snapshot';
        let wnd = window.open('', title, "_blank,titlebar=yes");
        let tn = wnd.document.createTextNode(text);
        wnd.document.title = title;
        wnd.document.body.style.whiteSpace = 'pre';
        wnd.document.body.style.fontFamily = 'monospace';
        wnd.document.body.appendChild(tn);
    }
    termInput.focus();
}

function button_term_sendfile() {
    inp = document.getElementById("send-file");
    inp.value = null;
    inp.click();
    termInput.focus();
}

function sendSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = async function(e) {
        var contents = e.target.result;
        await term_tx(contents);
        setStatus('OK', null);
    };
    reader.onerror = function(e) {
        setStatus('error', reader.error);
        reader.abort();
    };
    reader.readAsText(file);
}

function productDetect(str) {
    if (!str.startsWith('AntiLog')) { return; }
    let headerParts = str.split(',');
    if (headerParts.length < 3) { return; }
    let nameVer = headerParts[0].split(' ');
    if (nameVer.length != 2) { return; }
    let parts = nameVer[0].split('-');
    if (parts.length != 2) { return; }
    let confStr = headerParts[1];
    let index = confStr.search('ASL/');
    if (index < 0) { return; }
    let aslConf = new ASLConfig(confStr.substring(index));
    let pid = aslConf.getPID();
    let optsStr = parts[1];
    let verStr = nameVer[1];
    switch (parts[0]) {
        case 'AntiLog':
            break;
        case 'AntiLog_OEM':
            optsStr += 'O';
            break;
        case 'AntiLogPro':
            break;
        case 'AntiLogPro_OEM':
            optsStr += 'O';
            break;
        case 'AntiLogPro2':
            break;
        case 'AntiLogPro2_OEM':
            optsStr += 'O';
            break;
    }
    if (aslConf.isValid()) { setProduct(aslConf, optsStr, verStr); }
}

function setProduct(aslConf, optsStr = '', verStr = '') {
    let aslOpts = new ASLOptions('');
    aslOpts.addAsString(optsStr);
    aslVer = new ASLVersion(verStr);
    if ((main_aslConfig.getPID() != aslConf.getPID()) ||
        (!aslOpts.equals(main_aslOptions)) || main_firstTime) {
        main_firstTime = false;
        main_aslConfig.set(aslConf);
        main_aslOptions.set(aslOpts);
        main_aslVersion.set(aslVer);
        img_0 = document.getElementById("product-image-term");
        img_0.style.display = "none";
        img_16 = document.getElementById("product-image-antilog");
        img_16.style.display = "none";
        img_16_oem = document.getElementById("product-image-antilog-oem");
        img_16_oem.style.display = "none";
        img_23 = document.getElementById("product-image-antilogpro");
        img_23.style.display = "none";
        img_23_oem = document.getElementById("product-image-antilogpro-oem");
        img_23_oem.style.display = "none";
        img_27 = document.getElementById("product-image-antilogpro2");
        img_27.style.display = "none";
        img_27_oem = document.getElementById("product-image-antilogpro2-oem");
        img_27_oem.style.display = "none";
        switch (main_aslConfig.getPID()) {
            case 16:
                if (aslOpts.isOEM()) {
                    img_16_oem.style.display = "block";
                } else { img_16.style.display = "block"; }
                break;
            case 23:
                if (aslOpts.isOEM()) {
                    img_23_oem.style.display = "block";
                } else { img_23.style.display = "block"; }
                break;
            case 27:
                if (aslOpts.isOEM()) {
                    img_27_OEM.style.display = "block";
                } else { img_27.style.display = "block"; }
                break;
            default:
                img_0.style.display = "block";
                main_aslConfig.clear();
                main_aslOptions.clear();
                main_aslVersion.clear();
        }
        let button = document.getElementById("button-ug");
        if (main_aslConfig.isValid()) {
            let str = 'Open a new page containing all user guides relating to this ';
            str += main_aslConfig.getProductName();
            if (main_aslOptions.isOEM()) { str += ' OEM'; }
            str += ' unit';
            button.title = str;
            button.style.display = 'inline-block';
        } else { button.style.display = 'none'; }
    }
}

function setInnerHTML(element, value) {
    if (element.innerHTML != value) { element.innerHTML = value; }
}

function createXmlHttpRequestObject() {
    var xmlhttp;
    try {
        if (window.XMLHttpRequest) { xmlhttp = new XMLHttpRequest(); } else { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); }
    } catch (e) {
        xmlhttp = false;
    }
    return (xmlhttp);
}

function do_processUserGuide(aslConfig, aslVer, aslOpts) {
    let pid = aslConfig.getPID();
    let sn = aslConfig.getSerialNumber();
    let single = aslVer.isSingle(pid) ? 1 : 0;
    xhr = createXmlHttpRequestObject();
    if (xhr) {
        if ((xhr.readyState == 0) || (xhr.readyState == 4)) {
            try {
                let args = "?pid=" + pid + "&sn=" + sn + "&ver=" + aslVer.toString() + "&opts=" + aslOpts.get() + "&single=" + single;
                let url = "aslwebterm_ug_process.php";
                xhr.open("GET", url + args, true);
                xhr.responseType = 'text';
                xhr.onload = function() { aslwebterm_ug_process_serverResponse(this); };
                xhr.send(null);
            } catch (e) { alert(e.toString()); }
        } else {
            setTimeout('do_processUserGuide("' +
                pid + '","' + optsStr + '","' + verStr + '")', 1000);
        }
    }
}

function aslwebterm_ug_process_serverResponse(xhr) {
    if (xhr.status == 200) { text = xhr.response; if (text != null) { window.open(text, "_blank"); return; } }
    alert('Something went wrong: ' + xhr.statusText + ', ' + xhr.response);
}
async function serial_open() {
    main_port_quit = false;
    try {
        main_port = await navigator.serial.requestPort({});
    } catch (e) {
        let message = e.message;
        if (message != "No port selected by the user.") {
            console.log('serial_connect(): ', message);
        }
        main_port = null;
        return;
    }
    serialStgs.update();
    let args = {
        baudRate: serialStgs.getBaud(),
        dataBits: serialStgs.getDataBits(),
        stopBits: serialStgs.getStopBits(),
        parity: serialStgs.getParity(),
        bufferSize: 16384,
        flowControl: "none"
    };
    try { await main_port.open(args); } catch (e2) {
        let msg = e2.message;
        if (msg == 'Failed to open serial port.') {
            msg = 'Port in use? ' + msg;
        }
        console.log('serial_connect(): ', msg);
        setStatus('error', msg);
        main_port = null;
        return;
    }
    setStatus('OK', null);
    if (main_port) {
        main_serialReaderPromise = serialreader();
        setTermState('connected');
        setPanel('terminal');
    } else { setTermState('disconnected'); }
}
async function serial_close() {
    setStatus('warning', 'Closing serial port');
    main_port_quit = true;
    if (main_port) {
        if (main_reader != null) { main_reader.cancel(); }
        await main_serialReaderPromise;
    }
    setStatus('OK', null);
}
async function serialWrite(data) {
    while ((!main_port_quit) && (data != null) && (main_port && main_port.writable)) {
        const dataArrayBuffer = main_textEncoder.encode(data);
        main_writer = main_port.writable.getWriter();
        let isOK = true;
        try { await main_writer.write(dataArrayBuffer); } catch (e) {
            isOK = false;
            console.log(e);
        } finally {
            main_writer.releaseLock();
        }
        main_writer = null;
        if (main_port_quit || (!isOK)) { break; }
        data = txBuffer.getNext();
        setMainProgress();
    }
    await sleep(10);
}
async function serialreader() {
    while (main_port.readable && (!main_port_quit)) {
        main_reader = main_port.readable.getReader();
        try {
            while (!main_port_quit) {
                const { value, done } = await main_reader.read();
                if (done) { break; }
                let text = main_textDecoder.decode(value);
                termLines.appendTermText(text);
                termInputUpdate();
            }
        } catch (error) { console.log(error); } finally {
            main_reader.releaseLock();
            main_reader = null;
        }
    }
    let timeout = 30;
    while (main_writer && timeout) {
        await sleep(100);
        timeout--;
    }
    await main_port.close();
    if (("serial" in navigator) && ("forget" in SerialPort.prototype)) { await main_port.forget(); }
    main_port = null;
    main_reader = null;
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
var termInput;
var termLines = new TermLineList(1024);
var txBuffer = new TxBufferList();
var serialStgs = new SerialSettings();
var sendFile = null;
var statusline_lines;
var main_termState = null;
var main_progress = false;
var progress_max = 0;
var main_firstTime = true;
var main_aslOptions = new ASLOptions('');
var main_aslVersion = new ASLVersion('');
var main_aslConfig = new ASLConfig('');
var main_port = null;
var main_port_counter = 0;
var main_port_quit = false;
var main_reader = null;
var main_writer = null;
var main_serialReaderPromise;
var main_serialWriterPromise;
var main_textEncoder = new TextEncoder();
var main_textDecoder = new TextDecoder();
var main_headerBarLine_div;
var main_menuBarLine_div;
var main_panel_div;
var main_menuBottomMargin;

function main_menu_init(bottom_margin = 16) {
    main_menuBottomMargin = bottom_margin;
    main_headerBarLine_div = document.getElementById("headerbarline");
    main_menuBarLine_div = document.getElementById("menubarline");
    main_panel_div = document.getElementById("main-panel");
    main_menuBarLine_div.style.top = main_headerBarLine_div.clientHeight + "px";
    main_menu_fadeHeader();
}

function main_menu_fadeHeader() {
    let bottom_margin = 16;
    if (!main_headerBarLine_div) return;
    let remaining = parseInt(main_menuBarLine_div.style.top);
    if (remaining > 0) {
        remaining -= 5;
        if (remaining <= 0) {
            remaining = 0;
        }
        main_menuBarLine_div.style.top = String(remaining) + "px";
        main_headerBarLine_div.style.top =
            String(remaining - main_headerBarLine_div.clientHeight) + "px";
        let top = remaining + main_menuBarLine_div.clientHeight +
            main_menuBottomMargin;
        main_panel_div.style.marginTop = String(top) + "px";
        setTimeout(main_menu_fadeHeader, 20);
    }
}