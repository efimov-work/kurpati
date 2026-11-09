import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as pause } from 'node:timers/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'artifacts');
await mkdir(output, { recursive: true });
const site = process.env.TEST_SITE_URL || 'http://127.0.0.1:3010';
const port = 9237;
const browser = spawn('google-chrome-stable', ['--headless', '--disable-gpu', '--no-sandbox', '--remote-allow-origins=*', `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/kurpati-browser-qa', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
let socket;
const pending = new Map();
let id = 0;
const failures = [];
const checks = [];
function send(method, params = {}) {
    const requestId = ++id;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
        pending.set(requestId, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id: requestId, method, params }));
    });
}
async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result?.value;
}
async function viewport(width, height = 960) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await pause(180);
}
async function screenshot(name, full = false) {
    const data = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: full });
    await writeFile(path.join(output, name), Buffer.from(data.data, 'base64'));
}
function check(ok, label, detail) {
    checks.push({ label, ok, detail });
    if (!ok) failures.push({ label, detail });
}

try {
    for (let attempt = 0; attempt < 60; attempt++) {
        try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break; }
        catch { await pause(150); }
    }
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
    const runtimeErrors = [];
    socket.addEventListener('message', event => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            const waiter = pending.get(message.id);
            clearTimeout(waiter.timeout);
            pending.delete(message.id);
            if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
            else waiter.resolve(message.result);
        }
        if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
    });
    await send('Page.enable');
    await send('Runtime.enable');
    await viewport(1440, 1000);
    await send('Page.navigate', { url: site });
    for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate('document.readyState === "complete" && !!document.querySelector(".motion-ready")')) break;
        await pause(300);
    }
    await evaluate('document.fonts.ready');
    await pause(1800);
    check(await evaluate('document.querySelectorAll("h1").length === 1'), 'single main heading');
    check(await evaluate('![...document.querySelectorAll("h1,h2,h3")].some(e => { const t=e.textContent.replace(/[^а-яА-Яa-zA-ZёЁ]/g, ""); return t.length > 3 && t === t.toUpperCase(); })'), 'sentence case headings');
    check(await evaluate('!/[—–]/.test(document.body.innerText)'), 'no long dashes');
    check(await evaluate('[...document.images].filter(i => i.loading !== "lazy").every(i => i.complete && i.naturalWidth > 0)'), 'hero image loaded');
    await screenshot('desktop-hero.png');
    const widths = [280, 320, 360, 375, 390, 414, 540, 600, 667, 740, 760, 768, 820, 912, 1000, 1001, 1024, 1280, 1366, 1440, 1920, 2560, 3440, 3840];
    for (const width of widths) {
        await viewport(width, width < 600 ? 844 : 1000);
        const metrics = await evaluate('({width:innerWidth,scroll:document.documentElement.scrollWidth,hero:document.querySelector(".hero").getBoundingClientRect().width,heading:document.querySelector("h1").getBoundingClientRect().right})');
        check(metrics.scroll <= metrics.width + 1, `no overflow at ${width}`, metrics);
    }
    await viewport(390, 844);
    await evaluate('scrollTo(0,0)');
    await pause(200);
    await screenshot('mobile-hero.png');
    await evaluate('document.querySelector(".menu-toggle").click()');
    await pause(150);
    check(await evaluate('document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "true" && !!document.querySelector(".mobile-nav")'), 'mobile menu opens');
    await screenshot('mobile-menu.png');
    await evaluate('document.querySelector(".mobile-nav button[data-request]").click()');
    await pause(450);
    check(await evaluate('document.querySelector(".request-dialog").open'), 'callback opens from mobile menu');
    await evaluate(`(() => { const f=document.querySelector('.request-dialog form');f.elements.name.value='Проверка';f.elements.phone.value='123';f.elements.consent.checked=true;f.requestSubmit(); })()`);
    check(await evaluate('!document.querySelector("[name=phone]").validity.valid'), 'incomplete phone rejected');
    await evaluate(`(() => { const f=document.querySelector('.request-dialog form');f.elements.phone.value='+7 (978) 123-45-67';f.elements.phone.dispatchEvent(new Event('input',{bubbles:true}));f.requestSubmit(); })()`);
    await pause(120);
    check(await evaluate('document.querySelector("#request-status").textContent.includes("не отправлена")'), 'demo does not claim delivery');
    check(await evaluate('!document.querySelector(".request-dialog input[type=date]") && !document.querySelector(".request-dialog select")'), 'callback has no booking fields');
    await screenshot('mobile-callback.png');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
    await pause(100);
    check(await evaluate('!document.querySelector(".request-dialog").open'), 'Escape closes callback');
    await evaluate('document.querySelector(".map-viewport").scrollIntoView({behavior:"instant",block:"center"})');
    await pause(800);
    check(await evaluate('document.querySelector(".map-base").naturalWidth === 1400 && document.querySelectorAll(".map-marker").length === 4'), 'geographic map and four landmarks loaded');
    check(await evaluate('(() => {const v=document.querySelector(".map-viewport"),p=document.querySelector(".map-marker-kurpati");const a=v.getBoundingClientRect(),b=p.getBoundingClientRect();return b.left>=a.left && b.right<=a.right;})()'), 'Kurpati marker visible on mobile');
    await screenshot('mobile-map.png');
    await evaluate('document.querySelector(".map-viewport").scrollLeft=10000');
    check(await evaluate('document.querySelector(".map-viewport").scrollLeft>0 && document.documentElement.scrollWidth<=innerWidth'), 'map pans inside mobile viewport');
    await evaluate('document.querySelector(".map-viewport").scrollLeft=0');
    await viewport(1440, 1000);
    await evaluate('document.querySelector(".map-viewport").scrollIntoView({behavior:"instant",block:"center"})');
    await pause(500);
    await screenshot('desktop-map.png');
    check(await evaluate('(() => { const m=document.querySelector(".map-marker-yalta");return m.href.includes("34.1658018,44.4941432"); })()'), 'landmark link uses verified promenade coordinates');
    await evaluate('document.querySelector("#experience").scrollIntoView({behavior:"instant"})');
    await pause(700);
    await evaluate('document.querySelector("#experience-tab-2").click()');
    await pause(750);
    check(await evaluate('document.querySelector("#experience-tab-2").getAttribute("aria-selected") === "true" && document.querySelector(".experience-description h3").textContent.includes("истории")'), 'experience tab changes image and text');
    await screenshot('desktop-experience.png');
    await evaluate('document.querySelector("#gallery").scrollIntoView({behavior:"instant"})');
    await pause(900);
    await evaluate('document.querySelector(".gallery-card").click()');
    await pause(300);
    check(await evaluate('document.querySelector(".lightbox").open'), 'photo lightbox opens');
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' });
    await pause(180);
    check(await evaluate('document.querySelector(".lightbox figcaption").textContent.includes("Другой взгляд")'), 'gallery keyboard navigation');
    await evaluate('document.querySelector(".lightbox").close()');
    await evaluate('document.querySelector(".faq details").open=true;document.querySelector(".faq").scrollIntoView({behavior:"instant"})');
    await pause(600);
    await screenshot('desktop-faq.png');
    await evaluate('document.querySelector(".contact-section").scrollIntoView({behavior:"instant",block:"center"})');
    await pause(400);
    await screenshot('desktop-contact.png');
    check(await evaluate('(() => {const e=document.querySelector(".contact-signature"),r=e.getBoundingClientRect(),s=e.parentElement.getBoundingClientRect();return e.textContent==="Курпаты" && r.right<=s.right && r.bottom<=s.bottom && r.left>=s.left;})()'), 'Kurpati signature is fully visible');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await pause(100);
    check(await evaluate('document.getAnimations().filter(a=>a.playState==="running").length===0'), 'reduced motion disables animation');
    check(runtimeErrors.length === 0, 'no runtime errors', runtimeErrors);
    const report = { site, passed: !failures.length, widths, checks, failures };
    await writeFile(path.join(output, 'browser-qa.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ passed: report.passed, checks: checks.length, failures }, null, 2));
    assert.equal(failures.length, 0, 'Browser QA failed');
} finally {
    socket?.close();
    browser.kill('SIGTERM');
}
