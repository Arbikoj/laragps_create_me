import "./bootstrap";
import "../css/app.css";
import "@protonemedia/laravel-splade/dist/style.css";

import { createApp } from "vue/dist/vue.esm-bundler.js";

import { renderSpladeApp, SpladePlugin } from "@protonemedia/laravel-splade";


// import "https://cdn.jsdelivr.net/gh/makeabilitylab/p5js/_libraries/serial.js";
const el = document.getElementById("app");

createApp({
        render: renderSpladeApp({ el })
    })
    .use(SpladePlugin, {
        "max_keep_alive": 10,
        "transform_anchors": false,
        "progress_bar": true
    })
    .mount(el);