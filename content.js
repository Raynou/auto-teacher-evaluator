const radios = document.querySelectorAll('input[type="radio"]');

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "evaluate") {
        await evaluate(radios, message.behaviour);
        sendResponse({ status: "ok" });
    } else if (message.action === "next-question") {
        goToNextQeuestion();
        sendResponse({ status: "ok" });
    } else if (message.action === "get-teachers") {
        const teachers = getTeachersList();
        sendResponse(teachers);
    }
    return true;
});

const evaluate = async (radios, grading) => {
    let min = 0, max = 4;
    let exceptions = await getExceptions();
    for (let i = 0; i < 7; i++) {
        let selected;
        const [hasException, teacher] = checkForException(i, exceptions);
        if (hasException) {
            grading = exceptions[teacher].behaviour;
        }
        if (grading === "random") {
            selected = Math.floor(Math.random() * (max - min + 1) + min);
        } else if (grading === "bad") {
            selected = max;
            if (getQuestionNumber() === "26") { // Tricky question
                selected = min;
            }
        } else if (grading === "good") {
            selected = min;
            if (getQuestionNumber() === "26") { // Tricky questions
                selected = max;
            }
        }
        radios[selected].click();
        min += 5;
        max += 5;
    }
};

const goToNextQeuestion = () => {
    const button = document.querySelector('input[type="button"]');
    if (getQuestionNumber() === "48") {
        // Clean storage
        chrome.storage.sync.set({ exceptions: {} });
    }
    button.click();
};

const getQuestionNumber = () => {
    const form = document.getElementsByName("citas")[0];
    const child = [...form.getElementsByTagName("b")].find((b) =>
        b.textContent.includes("Pregunta No.")
    );
    return child.textContent.split(" ")[2].split("/").shift() ?? null;
};

const getTeachersList = () => {
    const form = document.getElementsByName("citas")[0];
    const rows = form.querySelectorAll("table tbody tr");
    const teachers = [...rows].map((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length > 1) {
            return cells[1].textContent.trim();
        }
        return null;
    });
    return teachers;
};

const getExceptions = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get("exceptions", (data) => {
            resolve(data.exceptions);
        });
    });
};

const checkForException = (rowId, exceptions) => {
    console.log(exceptions);
    for (let tacher in exceptions) {
        if (exceptions[tacher].rowId === rowId) {
            return [true, tacher];
        }
    }
    return [false, ""];
};
