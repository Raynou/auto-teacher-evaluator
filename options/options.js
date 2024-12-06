const divContainer = document.getElementById("container");
const saveExceptionsButton = document.getElementById("save-exceptions-button");
let teachersExceptions = {};

const getTeachers = () => {
    return new Promise(async (resolve, _) => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        chrome.tabs.sendMessage(
            tab.id,
            { action: "get-teachers" },
            (response) => {
                resolve(response || []);
            },
        );
    });
};

const addSelectEventListeners = () => {
    setTimeout(() => {
        const selects = document.getElementsByClassName("teacher-select");
        Array.from(selects).forEach((select) => {
            select.addEventListener("change", (event) => {
                const selectedValue = event.target.value;
                const teacherName = select.dataset.teacherName;
                teachersExceptions[teacherName].behaviour = selectedValue;
                teachersExceptions[teacherName].hasException = true;
            });
        });
    }, 100);
};

saveExceptionsButton.addEventListener("click", () => {
    chrome.storage.sync.set({ exceptions: teachersExceptions });
    window.history.back();
});

const createOptionNode = (teacher, defaultSelection = "") => {
    const divTag = document.createElement("div");
    divTag.className = "teacher-option";

    const nameTag = document.createElement("span");
    nameTag.textContent = teacher;
    console.log(teacher);
    nameTag.className = "teacher-name";

    const selectTag = document.createElement("select");
    selectTag.className = "teacher-select";
    selectTag.dataset.teacherName = teacher;

    const behaviours = [
        { label: "Calificar mal", value: "bad" },
        { label: "Calificar bien", value: "good" },
        { label: "Aleatorio", value: "random" },
    ];

    behaviours.forEach((behaviour) => {
        const option = document.createElement("option");
        option.value = behaviour.value;
        option.textContent = behaviour.label;
        if (
            behaviour.value === defaultSelection ||
            behaviour.value === teachersExceptions[teacher].behaviour
        ) {
            option.selected = true;
        }
        selectTag.appendChild(option);
    });

    divTag.appendChild(nameTag);
    divTag.appendChild(selectTag);

    return divTag;
};

const fillList = async (exceptions = {}) => {
    const container = document.createElement("div");
    container.id = "options-container";
    const teachers = await getTeachers();
    if (Object.keys(exceptions).length === 0) {
        chrome.storage.sync.get("behaviour", (data) => {
            if (teachers.length === 0) {
                console.warn("No se encontraron docentes para listar.");
                container.textContent = "No se encontraron docentes.";
                return;
            }
            teachers.forEach((teacher, i) => {
                const info = {
                    rowId: i,
                    behaviour: data.behaviour,
                    hasException: false,
                };
                teachersExceptions[teacher] = info;
                const optionNode = createOptionNode(
                    teacher,
                    data.behaviour,
                );
                container.appendChild(optionNode);
            });
        });
    } else {
        teachersExceptions = exceptions;
        teachers.forEach((teacher) => {
            const optionNode = createOptionNode(
                teacher,
            );
            container.appendChild(optionNode);
        });
    }
    divContainer.appendChild(container);
};

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("exceptions", (data) => {
        fillList(data.exceptions);
        addSelectEventListeners();
    });
});
