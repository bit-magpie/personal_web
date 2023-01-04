const langList = document.querySelector("#lang-list");
const techList = document.querySelector("#tech-list");
const progList = document.querySelector("#prog-list");

const basicList = document.querySelector("#basic-records");
const titleTop = document.querySelector("#title-top");
const postionTop = document.querySelector("#position-top");
const descTop = document.querySelector("#desc-top");
const eduList = document.querySelector("#edu-records");
const expList = document.querySelector("#exp-records");

function createProgress(percetage) {
    const pBar = document.createElement("div");
    pBar.classList.add("p-bar");

    const progess = document.createElement("div");
    progess.style.width = percetage + "%";
    progess.classList.add("progress");
    pBar.appendChild(progess);
    
    return pBar;
}

function loadHeader() {
    titleTop.innerText = headerData.title;
    postionTop.innerHTML = headerData.position;
    descTop.innerHTML = headerData.desc;
}

function loadBasicInfo() {
    basicInfo.forEach((data) => {
        const record = document.createElement("li");
        record.classList.add("record");

        const recIcon = document.createElement("i");
        recIcon.classList.add("fa");
        recIcon.classList.add(data.icon);
        record.appendChild(recIcon);

        const recLabel = document.createElement("div");
        recLabel.classList.add("rec-label");
        recLabel.innerText = data.label + ":";
        record.appendChild(recLabel);

        const recValue = document.createElement("div");
        recValue.classList.add("rec-value");
        if (data.isLink) {
            recValue.innerHTML = "<a href='" + data.url + "'>" + data.value + "</a>";
        } else {
            recValue.innerText = data.value;
        }
        record.appendChild(recValue);

        basicList.appendChild(record);
    });    
}

function loadEduInfo() {
    eduInfo.forEach((eduData) => {
        const eduEntry = document.createElement("li");
        eduEntry.classList.add("entry");

        const recInst = document.createElement("div");
        recInst.classList.add("rec-inst");
        recInst.innerText = eduData.institute;
        eduEntry.appendChild(recInst);

        const recAch = document.createElement("div");
        recAch.classList.add("rec-ach");
        recAch.innerText = eduData.achievement;
        eduEntry.appendChild(recAch);

        const recPeriod = document.createElement("div");
        recPeriod.classList.add("rec-per");
        recPeriod.innerText = eduData.period;
        eduEntry.appendChild(recPeriod);

        eduList.appendChild(eduEntry);
    });
}

function loadExpInfo() {
    expInfo.forEach((expData) => {
        const expEntry = document.createElement("li");
        expEntry.classList.add("entry");

        const recInst = document.createElement("div");
        recInst.classList.add("rec-inst");
        recInst.innerText = expData.institute;
        expEntry.appendChild(recInst);

        const recPos = document.createElement("div");
        recPos.classList.add("rec-pos");
        recPos.innerText = expData.position;
        expEntry.appendChild(recPos);

        const recRes = document.createElement("div");
        recRes.classList.add("rec-res");
        recRes.innerText = expData.resposibility;
        expEntry.appendChild(recRes);

        const recTechs = document.createElement("div");
        recTechs.classList.add("rec-techs");
        recTechs.innerHTML = "<b>Technologies: </b>" + expData.techs;
        expEntry.appendChild(recTechs);

        const recPeriod = document.createElement("div");
        recPeriod.classList.add("rec-per");
        recPeriod.innerText = expData.period;
        expEntry.appendChild(recPeriod);

        expList.appendChild(expEntry);
    });
}

function loadLangs() {
    langInfo.forEach((langData) => {
        const langEntry = document.createElement("li");
        langEntry.classList.add("entry");

        const recIcon = document.createElement("i");
        recIcon.classList.add("fa");
        recIcon.classList.add("fa-circle");
        langEntry.appendChild(recIcon);

        const recLang = document.createElement("div");
        recLang.classList.add("rec-lang");
        recLang.innerText = langData.lang;
        langEntry.appendChild(recLang);

        const recLevel = document.createElement("div");
        recLevel.classList.add("rec-level");
        recLevel.innerText = langData.level;
        langEntry.appendChild(recLevel);

        langList.appendChild(langEntry);
    });
}

function loadTechs() {
    techInfo.forEach((techData) => {
        const techEntry = document.createElement("li");
        techEntry.classList.add("entry");

        const recIcon = document.createElement("i");
        recIcon.classList.add("fa");
        recIcon.classList.add("fa-circle");
        techEntry.appendChild(recIcon);

        const recTech = document.createElement("div");
        recTech.classList.add("rec-tech");
        recTech.innerText = techData;
        techEntry.appendChild(recTech);

        techList.appendChild(techEntry);
    });
}

function loadProg() {
    progInfo.forEach((progData) => {
        const progEntry = document.createElement("li");
        progEntry.classList.add("entry");

        const recProg = document.createElement("div");
        recProg.classList.add("rec-tech");
        recProg.innerText = progData.lang;
        progEntry.appendChild(recProg);

        progEntry.appendChild(createProgress(progData.level));

        progList.appendChild(progEntry);
    });
}

loadHeader();
loadBasicInfo();
loadEduInfo();
loadExpInfo();

loadTechs();
loadLangs();
loadProg();
