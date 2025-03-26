import tls from 'node:tls';

import {
  depack,
  enpack,
  generateID,
} from '@quanxiaoxiao/bytes';

import decodeAnswer from '../src/decodeAnswer.mjs';
import encodeV4 from '../src/encodeV4.mjs';
import encodeV6 from '../src/encodeV6.mjs';

const hostnameList = [
  'www.baidu.com',
  'www.zhihu.com',
  'www.qq.com',
  'anthropic.com',
  'xmailserver.org',
  'apple.com',
  'appsmith.com',
  'zettlr.com',
  'archive.ph',
  'bing.com',
  'z-library.sk',
  'gumroad.com',
  'chatgpt.com',
  'openai.com',
  'bootstrapcdn.com',
  'ycombinator.com',
  'fcdn.sk',
  'singlelogin.re',
  'youtu.be',
  'capital.com',
  'clarity.ms',
  'fontello.com',
  'claude.ai',
  'imgur.com',
  'codepen.io',
  'criteo.com',
  'datadoghq.com',
  'datatables.net',
  'day.js.org',
  'disqus.com',
  'docker.com',
  'dribbble.com',
  'duckduckgo.com',
  'eslint.org',
  'facebook.com',
  'facebook.net',
  'freecodecamp.org',
  'freetls.fastly.net',
  'fupanhao.com',
  'geeksforgeeks.org',
  'ggpht.com',
  'gitbook.com',
  'github.com',
  'github.githubassets.com',
  'github.io',
  'githubusercontent.com',
  'go.sonobi.com',
  'google.co.jp',
  'google.com',
  'google.com.hk',
  'googleapis.com',
  'googlesyndication.com',
  'googletagmanager.com',
  'googleusercontent.com',
  'googlevideo.com',
  'gravatar.com',
  'gstatic.com',
  'gvt2.com',
  'hsforms.com',
  'hsforms.net',
  'ibm.com',
  'jinse.cn',
  'jquery.com',
  'jsdelivr.net',
  'json2jsonp.com',
  'jsonp.afeld.me',
  'medium.com',
  'microsoft.com',
  'mozilla.org',
  'nodejs.org',
  'npmjs.com',
  'npmjs.org',
  'observablehq.com',
  'opencollective.com',
  'openstreetmap.org',
  'openx.net',
  'patreon.com',
  'pinimg.com',
  'pinterest.com',
  'pinterest.jp',
  'quora.com',
  'rawgit.com',
  'recaptcha.net',
  'redd.it',
  'reddit.com',
  'redditmedia.com',
  'redditstatic.com',
  'scorecardresearch.com',
  'snigelweb.com',
  'stack.imgur.com',
  'stadiamaps.com',
  'staticfile.org',
  't.co',
  't.me',
  'twimg.com',
  'twitter.com',
  'unpkg.com',
  'usefathom.com',
  'v2ex.com',
  'v2ray.com',
  'voachinese.com',
  'w3schools.com',
  'web.dev',
  'wikihow.com',
  'wikimedia.org',
  'wikipedia.org',
  'withgoogle.com',
  'x.com',
  'yandex.ru',
  'youtube.com',
  'ytimg.com',
  'z-library.rs',
  'z-library.se',
  'zlibrary-africa.se',
  'zlibrary-ca.se',
];

const socket = tls.connect({
  host: '223.5.5.5',
  noDelay: true,
  port: 853,
  secureContext: tls.createSecureContext({
    secureProtocol: 'TLSv1_2_method',
  }),
});

const _id = generateID();

const index = 12;

socket.on('connect', () => {
  console.log('connect');
  socket.write(enpack(encodeV6({
    transactionId: _id(),
    hostname: hostnameList[index],
  }), 2));
});

const executeDepack = depack();

socket.on('data', (chunk) => {
  const ret = executeDepack(chunk);
  if (ret) {
    const { payload } = decodeAnswer(ret.payload);
    console.log(payload);
  }
});

socket.on('close', () => {
  console.log('close');
});
