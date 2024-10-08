
let hostname = window.location.hostname;
let videoEle = null;


//由于网站域名总是变，暂时从代码里的title里打是否含有'555电影'来判断是不是这个网站
let title = document.title
if (title.indexOf("555电影") != -1) {
    hostname = "555pian.com"
}
console.log("当前页面域名: ",hostname)

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function getData(hostname) {
    tmplist = {
        "skipMidsegmentRules":[]
    };
    await chrome.storage.sync.get().then((result) => {
        if (result.skipHeadAndEndRules) {
            let list = result.skipHeadAndEndRules
            for (let i = 0; i < list.length; i++) {
                if (list[i].domain == hostname && list[i].isSkip == 1) {
                    tmplist.skipHeadAndEndRules = list[i];
                }
            }
        }

        if (result.skipMidsegmentRules) {
            let midList = result.skipMidsegmentRules
            for (let i = 0; i < midList.length; i++) {
                if (midList[i].domain == hostname && midList[i].isSkip == 1) {
                    tmplist.skipMidsegmentRules.push(midList[i])
                }
            }
        }
    });

    return tmplist;
}

//暂时不用
function getNextEpBtnEle() {
    const classNames = {
        'v.qq.com': '.txp_btn_next_u',
        'www.bilibili.com': '.squirtle-video-next',
        'www.iqiyi.com': '.iqp-btn-next',
        'v.youku.com': '.kui-next-icon-0',
        '555pian.com': '.art-control-next_episode',
        'www.miguvideo.com': 'next-btn'
    };

    if (hostname == '555pian.com') {
        let iframe = document.querySelector('#play_iframe');
        if (!iframe) return;
        return iframe.contentWindow.document.querySelector(classNames[hostname]);
    }

    return document.querySelector(classNames[window.location.hostname]);
}

function getFullscreenBtnEle() {
    const classNames = {
        'v.qq.com': '.txp_btn_fullscreen',
        // 'www.bilibili.com': '.squirtle-video-next',
        'www.iqiyi.com': '.screen-small',
        'v.youku.com': '.kui-fullscreen-icon-0',
        '555pian.com': '.art-control-fullscreen',
        'www.miguvideo.com': '.zoom-in'
    };

    if (hostname == '555pian.com') {
        let iframe = document.querySelector('#play_iframe');
        if (!iframe) return;
        return iframe.contentWindow.document.querySelector(classNames[hostname]);
    }

    return document.querySelector(classNames[window.location.hostname]);
}

async function getVideoEle() {
    await sleep(1000).then(() => {
        videoElements = document.querySelectorAll('video');
    })
    videoEle = Array.from(videoElements).filter(node => !!node.duration)[0] || null;

    return videoEle;
}

async function get555filmVideoEle() {
    for (let i = 0; i < 10; i++) {
        let iframe = document.querySelector('#play_iframe');
        if (!iframe) break;
        await sleep(1000).then(() => {
            videoEle = iframe.contentWindow.document.querySelector('video')
        })
        if (videoEle) break;
    }
    return videoEle;
}

async function timeupdateEvent(videoEle) {
    let res = await getData(hostname);
    if (!res) return;

    let startTime = 0;
    let endTime = 0;
    let midStartTime = 0;
    let midDuration = 0;

    if (res.skipHeadAndEndRules) {
        startTime = res.skipHeadAndEndRules.startMinute * 60 + parseInt(res.skipHeadAndEndRules.startSecond)
        endTime = res.skipHeadAndEndRules.endMinute * 60 + parseInt(res.skipHeadAndEndRules.endSecond)
    }

    let currentTime = videoEle.currentTime;
    let duration = videoEle.duration;

    let isStart = currentTime <= startTime
    let isEnd = duration - currentTime <= endTime;

    if (isStart) {
        videoEle.currentTime = startTime
    }
    if (isEnd) {
        nextBtn = getNextEpBtnEle();
        if (nextBtn) nextBtn.click();
        setTimeout(() => {
            videoEle.currentTime = startTime;
        }, 1000);
        // fullscreenBtn = getFullscreenBtnEle();
        // if(fullscreenBtn) fullscreenBtn.click();
    }
    if (res.skipMidsegmentRules) {
        list = res.skipMidsegmentRules
        for (let i = 0; i < list.length; i++) {
            midStartTime = list[i].startMinute * 60 + parseInt(list[i].startSecond)
            midDuration = list[i].duration;

            if (midStartTime == Math.floor(currentTime)) {
                videoEle.currentTime = parseInt(midDuration) + parseInt(currentTime)
                break;
            }
        }
    }
}


async function skipHeadAndEnd() {
    if (hostname == "555pian.com") {
        videoEle = await get555filmVideoEle()
    } else {
        videoEle = await getVideoEle();
    }

    if (videoEle) {
        videoEle.addEventListener("timeupdate", timeupdateEvent(videoEle));

        // if (hostname == '555pian.com') {
        //     eptab = document.querySelector('div.play-tab-list.active');
        //     epbtns = eptab.querySelectorAll('a.module-play-list-link');
        //     for (let i = 0; i < epbtns.length; i++) {
        //         epbtns[i].onclick = function () {
        //             videoEle.addEventListener("timeupdate", timeupdateEvent(videoEle));
        //         }
        //     }
        // }else{
        //     videoEle.addEventListener("timeupdate", timeupdateEvent(videoEle));
        // }
        
    }
}

setInterval(() => {
    skipHeadAndEnd()
}, 1000)
