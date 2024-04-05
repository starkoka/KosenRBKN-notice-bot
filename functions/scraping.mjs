import fetch from 'node-fetch';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

export async function fetchWebsite(){
    const url = "https://www.google.com";
    const res = await fetch(url);
    const html = await res.text();
    const dom = new JSDOM(html);
    console.log(dom.window.document.querySelector("title").textContent);
}
