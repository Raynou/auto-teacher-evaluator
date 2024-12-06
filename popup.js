const evaluateButton = document.getElementById("evaluate-button");
const nextQuestionButton = document.getElementById("next-question-button");
const addExceptionButton = document.getElementById("add-exception-button");
const behaviourRadioButtons = document.querySelectorAll(
    'input[name="behaviour"]',
);

behaviourRadioButtons.forEach((button) => {
    button.addEventListener("change", () => {
        const selectedBehaviour = [...behaviourRadioButtons].find((button) =>
            button.checked
        )?.value;
        if (selectedBehaviour) {
            chrome.storage.sync.set({ behaviour: selectedBehaviour });
        }
    });
});

evaluateButton.addEventListener("click", async () => {
    const behaviour = [...behaviourRadioButtons].find((button) =>
        button.checked
    )?.value;
    if (!behaviour) {
        console.error("Ningún comportamiento fue seleccionado");
        return;
    }
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    chrome.tabs.sendMessage(
        tab.id,
        { action: "evaluate", behaviour: behaviour },
        (response) => {
        },
    );
});

nextQuestionButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
    });
    chrome.tabs.sendMessage(
        tab.id,
        { action: "next-question", behaviour: "" },
        (response) => {
        },
    );
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("behaviour", (data) => {
        if (data.behaviour) {
            const selectedRadio = document.querySelector(
                `input[name="behaviour"][value="${data.behaviour}"]`,
            );
            if (selectedRadio) selectedRadio.checked = true;
        }
    });
});
