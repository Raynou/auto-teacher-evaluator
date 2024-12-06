chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        if (command === "evaluate") {
            await evaluate([tab]);
        } else if (command === "next-question") {
            await next([tab]);
        } else if (command === "evaluate-next") {
            await evaluate([tab]);
            await next([tab]);
        }
    });
});

const evaluate = ([tab]) => {
    return new Promise((resolve, _) => {
        chrome.storage.sync.get("behaviour", (data) => {
            if (data.behaviour) {
                chrome.tabs.sendMessage(
                    tab.id,
                    { action: "evaluate", behaviour: data.behaviour },
                    (response) => {
                    },
                );
                resolve();
            }
        });
    });
};

const next = ([tab]) => {
    return new Promise((resolve, _) => {
        chrome.tabs.sendMessage(
            tab.id,
            { action: "next-question", behaviour: "" },
            (response) => {
            },
        );
        resolve();
    });
};
