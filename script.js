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
let spells = [];

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

  // don't try to add the "Spell List" option
  if (spellName != "default") {
    let match = matches.find((match) => match.name == spellName);
    spells.push(spellName);

    let ritual = "";
    if (match.ritual == "yes") {
      ritual = " (Ritual)";
    }

    let concentration = "";
    if (match.concentration == "yes") {
      concentration = " (Concentration)";
    }

    let material = "";
    if (match.material.length > 0) {
      material = ` (${match.material})`;
    }

    let higherLevel = "";
    if (match.higher_level.length > 0) {
      higherLevel = `<p>
                <scan class="fw-bold">At higher levels:</scan> ${match.higher_level}
              </p>`;
    }

    spellbook.innerHTML += `
      <div class="card">
        <div class="card-header d-flex justify-content-between fs-6">
          <a
            href="https://open5e.com/spells/${match.slug}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-danger"
            >${match.name}</a
          >
          <span>${match.level} ${match.school} | ${match.dnd_class}</span>
        </div>
        <div class="card-body">
          <p><scan class="fw-bold">Range:</scan> ${match.range}</p>
          <p>
            <scan class="fw-bold">Casting Time:</scan> ${
              match.casting_time + ritual
            }
          </p>
          <p>
            <scan class="fw-bold">Duration:</scan> ${
              match.duration + concentration
            }
          </p>
          <p class="fw-bold">
            Components: ${match.components} ${material}
          </p>
          <p>${match.desc}</p>
          ${higherLevel}
        </div>
      </div>
      `;

    var matchIndex = matches.indexOf(match);
    document.querySelector("#option-index-" + matchIndex).remove();
  }
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

        if (spells.includes(result.name)) {
          continue;
        }

        let resultClassesArray = result.dnd_class.split(", ");

        if (hasClassFilter) {
          for (let j = 0; j < resultClassesArray.length; j++) {
            if (
              classFilter == resultClassesArray[j] &&
              (!hasLevelFilter || levelFilter == result.level_int)
            ) {
              matches.push(result);
              let newMatchIndex = matches.length - 1;
              filteredSpellList.innerHTML += `<option id="option-index-${newMatchIndex}" value="${result.name}">${result.name}</option>`;
            }
          }
        } else {
          if (levelFilter == result.level_int) {
            matches.push(result);
            let newMatchIndex = matches.length - 1;
            filteredSpellList.innerHTML += `<option id="option-index-${newMatchIndex}" value="${result.name}">${result.name}</option>`;
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
