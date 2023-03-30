/* 
POPULATE FILTERED SPELL LIST
1. wait for user to change filter
2. call function to collect value and request API
3. parse through API according to filter options
4. populate Filtered Spells drop-down with matching options
 */

let classFilter = document.querySelector("#class-filter").value;
let previousClassFilter = classFilter;
let levelFilter = document.querySelector("#level-filter").value;
let previousLevelFilter = levelFilter;
let filteredSpellList = document.querySelector("#spell-list");
let defaultSpellList = filteredSpellList.innerHTML;
let matches = [];

let spellbook = document.querySelector("#spellbook");

function getClassFilter(element) {
  classFilter = element.value;
}

function getLevelFilter(element) {
  levelFilter = element.value;
}

function onClassFilterChange(element) {
  previousClassFilter = element.oldValue;
}

function onLevelFilterChange(element) {
  previousLevelFilter = element.oldValue;
}

function resetPreviousFilterValues() {
  previousClassFilter = classFilter;
  previousLevelFilter = levelFilter;
}

function checkFilterChange() {
  return (
    previousClassFilter != classFilter || previousLevelFilter != levelFilter
  );
}

function resetFilteredList() {
  filteredSpellList.innerHTML = defaultSpellList;
}

function addCardToSpellbook(spellListElement) {
  let spellName = spellListElement.value;
  if (spellName != "default") {
    console.log(spellName);
    let match = matches.find((match) => match.name == spellName);
    console.log(match);
  }

  // if (match != "undefined") {

  //   spellbook.innerHTML +=
  // }
}

async function populateFilter(data) {
  let hasClassFilter = !(classFilter == "default");
  let hasLevelFilter = !(levelFilter == "default");

  for (var a = data.results.length; a <= data.count; a += data.results.length) {
    // check that a filter is active
    if (hasClassFilter || hasLevelFilter) {
      // loop through this page of results
      for (let i = 0; i < data.results.length; i++) {
        let result = data.results[i];
        let resultClassesArray = result.dnd_class.split(", ");

        if (hasClassFilter) {
          for (let j = 0; j < resultClassesArray.length; j++) {
            if (
              classFilter == resultClassesArray[j] &&
              (!hasLevelFilter || levelFilter == result.level_int)
            ) {
              matches.push(result);
              filteredSpellList.innerHTML += `<br><option value="${result.name}">${result.name}</option>`;
            }
          }
        } else {
          if (levelFilter == result.level_int) {
            matches.push(result);
            filteredSpellList.innerHTML += `<br><option value="${result.name}">${result.name}</option>`;
          }
        }
      }
    }
    if (a != data.count) {
      data = await fetch(data.next).then((response) => response.json());
    }
  }
}

// request url: https://api.open5e.com/spells/
async function requestAPI(filtersChanged) {
  // data-intensive; do not run unless the filters have been altered
  if (filtersChanged) {
    matches = [];
    resetPreviousFilterValues();
    const data = await fetch("https://api.open5e.com/spells/").then(
      (response) => response.json()
    );
    populateFilter(data);
  }
}
