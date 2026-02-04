const OUTSIDER_MODIFIER = 2;

let roles = [];
let ratios = [];
load_jsons();

async function load_jsons() {
    roles = await fetch('./roles.json').then(r => r.json());
    ratios = await fetch('./ratios.json').then(r => r.json());
}

// player count update logic
const input = document.querySelector("#player_count_input");
const output = document.querySelector("#player_count_output");
output.textContent = input.value;
input.addEventListener("input", () => {
  output.textContent = input.value;
});

// button click logic
document.getElementById("generate_code_button").addEventListener("click", () => generate_code(Number(input.value)));

// setup code generation logic
function index_in_ratios(player_count, key) {
  return ratios.find(r => r["Player Count"] === player_count)[key];
}

function takeRandom(arr) {
  const i = Math.floor(Math.random() * arr.length);
  return arr.splice(i, 1)[0];
}

function generate_code(num_players) {
    let num_townsfolk = index_in_ratios(num_players, "Townsfolk");
    let num_outsiders = index_in_ratios(num_players, "Outsiders");
    const num_mafia = index_in_ratios(num_players, "Mafia");

    let all_townsfolk = roles.filter(r => r.Alignment === "Townsfolk");
    let all_outsiders = roles.filter(r => r.Alignment === "Outsider");
    let all_mafia = roles.filter(r => r.Alignment === "Mafia");

    let used_roles = [];
    for (let i = 0; i < num_mafia; i++) {
        const new_mafia = takeRandom(all_mafia);
        used_roles.push(new_mafia); // select random Mafia roles
        if(new_mafia.Counterpart == "+2 Outsiders") { // basic Mafia check
        num_townsfolk -= OUTSIDER_MODIFIER;
        num_outsiders += OUTSIDER_MODIFIER;
        }
        const mafia_with_outsider_bluffs = used_roles.filter(r => r.Alignment == "Mafia" && r.Counterpart in all_outsiders);
        if(mafia_with_outsider_bluffs.length + num_outsiders >= 4) all_mafia = all_mafia.filter(r => !(r.Counterpart in all_outsiders)); // remove Outsider-bluff Mafia if needed
        if(mafia_with_outsider_bluffs.length + num_outsiders + OUTSIDER_MODIFIER >= 4) all_mafia = all_mafia.filter(r => r.Counterpart != "+2 Outsiders"); // remove Basic Mafia if needed
    }

    for (const mafia of used_roles) {
        all_townsfolk = all_townsfolk.filter(r => r.Counterpart !== mafia.Role);
        all_outsiders = all_outsiders.filter(r => r.Counterpart !== mafia.Role);
    }

    for (let i = 0; i < num_townsfolk; i++) used_roles.push(takeRandom(all_townsfolk));
    for (let i = 0; i < num_outsiders; i++) used_roles.push(takeRandom(all_outsiders));

    // output the setup code
    document.getElementById("code").innerHTML = used_roles.map(r => `${r.ID}a1b`).join("");
}