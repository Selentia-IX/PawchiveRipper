// ==UserScript==
// @name         Pawchive File Ripper
// @namespace    Tampermonkey/Violentmonkey Scripts
// @version      1.0
// @description  Fast, lightweight downloader for Pawchive. ZIP bundle generation using fflate.
// @author       Selentia-IX
// @icon         https://raw.githubusercontent.com/Selentia-IX/PawchiveRipper/main/pwr-logo.png
// @license      GPL-3.0-or-later; https://www.gnu.org/licenses/gpl-3.0.txt
// @match        https://pawchive.st/*
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://unpkg.com/fflate@0.8.2/umd/index.js
// @grant        GM_xmlhttpRequest
// @connect      pawchive.st
// @connect      *.pawchive.st
// ==/UserScript==

/* global fflate, jQuery */

(function waitForLibs() {
    if (typeof fflate === 'undefined' || typeof jQuery === 'undefined') {
        setTimeout(waitForLibs, 100);
        return;
    }

    (function($) {
        'use strict';

        function sanitizeString(str) {
            return str.replace(/[\\/:*?"<>|]/g, '_').trim();
        }

        function showLoadingBar(percent, labelText = '') {
            let bar = $('#kemono-download-loading');
            if (!bar.length) {
                bar = $('<div id="kemono-download-loading">')
                    .css({
                        position: 'fixed', top: '0', left: '0', width: '100%', height: '24px',
                        background: '#1a1a1a', borderBottom: '1px solid #333', zIndex: 99999,
                        color: '#fff', fontSize: '12px', textAlign: 'center', lineHeight: '24px',
                        fontFamily: 'sans-serif'
                    })
                    .append($('<div id="kemono-download-progress">').css({
                        position: 'absolute', top: '0', left: '0', height: '100%',
                        width: '0%', background: 'rgba(255, 149, 0, 0.3)', zIndex: -1
                    }))
                    .append($('<span id="kemono-download-text">'));
                $('body').append(bar);
            }
            $('#kemono-download-progress').css('width', percent + '%');
            $('#kemono-download-text').text(labelText || `Processing: ${percent}%`);
        }

        function hideLoadingBar() {
            $('#kemono-download-loading').remove();
        }

        function secureFetch(url) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: url,
                    responseType: 'arraybuffer',
                    headers: {
                        'Referer': window.location.origin,
                        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
                    },
                    onload: (res) => {
                        if (res.status >= 200 && res.status < 300) {
                            resolve(new Uint8Array(res.response));
                        } else {
                            reject(new Error(`HTTP ${res.status}`));
                        }
                    },
                    onerror: () => reject(new Error('Network Error'))
                });
            });
        }

        async function downloadKemonoMedia() {
            let mediaLinks = [];

            $('.post__files a.fileThumb, .post__thumbnail a.fileThumb').each(function() {
                const url = $(this).attr('href');
                if (url) {
                    const filename = $(this).attr('download') || url.split('/').pop().split('?')[0];
                    mediaLinks.push({ url, filename });
                }
            });

            $('.post__video, video').each(function() {
                const url = $(this).attr('src') || $(this).find('source').first().attr('src');
                if (url) {
                    const filename = url.split('/').pop().split('?')[0];
                    mediaLinks.push({ url, filename });
                }
            });

            mediaLinks = mediaLinks.filter((media, idx, arr) =>
                arr.findIndex(m => m.filename === media.filename) === idx
            );

            const total = mediaLinks.length;
            if (total === 0) {
                alert('No media links found.');
                return;
            }

            const title = sanitizeString($('.post__title span').first().text() || 'Post');
            const creator = sanitizeString($('.post__user-name').first().text() || 'Artist');
            const zipName = `${title} by ${creator}.zip`;

            showLoadingBar(0, `Preparing workspace for ${total} items...`);

            const zipStructure = {};

            for (let i = 0; i < total; i++) {
                const media = mediaLinks[i];
                const currentIndex = i + 1;
                showLoadingBar(Math.round((i / total) * 100), `Fetching item ${currentIndex} of ${total}...`);

                try {
                    const fileData = await secureFetch(media.url);
                    const ext = media.filename.includes('.') ? media.filename.split('.').pop() : 'png';
                    const customFilename = `${title}_${currentIndex}.${ext}`;

                    zipStructure[customFilename] = fileData;
                } catch (err) {
                    console.error(`Skipped entry map generation for: ${media.filename}`, err);
                }
            }

            showLoadingBar(99, 'Zipping files instantly...');

            fflate.zip(zipStructure, { level: 0 }, (err, data) => {
                hideLoadingBar();

                if (err) {
                    console.error('fflate processing error:', err);
                    alert('Failed to compile zip archive contents.');
                    return;
                }

                const blob = new Blob([data], { type: 'application/zip' });
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = blobUrl;
                a.download = zipName;
                document.body.appendChild(a);
                a.click();

                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(blobUrl);
                }, 200);
            });
        }

        function insertDownloadButton() {
            if ($('#kemono-download-btn').length) return;
            const actions = $('.post__actions');
            if (!actions.length) return;

            const btn = $('<button id="kemono-download-btn">')
                .text('Download & ZIP')
                .css({
                    marginLeft: '10px', padding: '5px 12px', background: '#ff9500',
                    color: '#fff', border: 'none', borderRadius: '5px',
                    cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
                })
                .click(function() {
                    $(this).prop('disabled', true).text('Packing...');
                    downloadKemonoMedia().finally(() => {
                        $(this).prop('disabled', false).text('Download & ZIP');
                    });
                });
            actions.append(btn);
        }

        $(document).ready(insertDownloadButton);
        const observer = new MutationObserver(insertDownloadButton);
        observer.observe(document.body, { childList: true, subtree: true });

    })(jQuery);
})();
