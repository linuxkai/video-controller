window.onload = function () {
	chrome.storage.sync.get().then((result) => {
		if (result) {
			let receiver = document.getElementById('ID-rule-iframe').contentWindow;
			receiver.postMessage(result, "*");
		} else {
			let receiver = document.getElementById('ID-rule-iframe').contentWindow;
			receiver.postMessage({ "skipHeadAndEndRules": [], "skipMidsegmentRules": [] }, "*");
		}
	});
};

window.addEventListener('message', function (e) {
	if (e.data.skipHeadAndEndRules) {
		chrome.storage.sync.set({ skipHeadAndEndRules: e.data.skipHeadAndEndRules });
	}

	if (e.data.skipMidsegmentRules) {
		chrome.storage.sync.set({ skipMidsegmentRules: e.data.skipMidsegmentRules });
	}

	if (e.data.colorTheme) {
		chrome.storage.sync.set({ colorTheme: e.data.colorTheme });
	}
});
