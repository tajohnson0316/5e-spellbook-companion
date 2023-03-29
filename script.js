/* 
POPULATE FILTERED SPELL LIST
1. wait for user to change filter
2. call function to collect value and request API
3. parse through API according to filter options
4. populate Filtered Spells drop-down with matching options
 */

let classFilter ='';
let levelFilter ='';
let filteredSpellList = document.querySelector('#spell-list');

function getClassFilter(element) {
  classFilter = element.value;
}

function getLevelFilter(element) {
  levelFilter = element.value;
}

async function populateFilter(data) {
  let optionNames = [];
  
  while(data.next !== null) {
    for(let j = 0; j < data.results.length; j++) {
      if (data.results[j].level_int == levelFilter) {
        optionNames.push(data.results[j].name);
      }

      let classArray = data.results[j].dnd_class.splice(" ");
      for (let k = 0; k < classArray.length; k++) {
        if (classFilter == classArray[k]) {
          optionNames.push(data.results[j].name);
        }
      }
    }
    data = (await fetch(data.next)).json;
  }
  console.log(optionNames);
}

// request url: https://api.open5e.com/spells/
async function requestAPI() {
  const response = await fetch("https://api.open5e.com/spells/");
  const data = response.json();
  filteredSpellList.innerHTML += populateFilter(data);
}