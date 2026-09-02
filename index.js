// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2607"; // Make sure to change this!
const RESOURCE = "/events";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];   

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with new guests from the API */
async function addGuest(guest) {
  try {
    const response = await fetch(API + "/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest),
    });
    const result = await response.json();
    guests.push(result.data);
    render();
  } catch (e) {
    console.error(e);
  }
}
async function addParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    const result = await response.json();
     if (!response.ok) {
      console.error("Add party failed:", result);
      return;
  }
    parties.push(result.data);
    render();
  } catch (e) {
    console.error(e);
  }
}
/**Deletes the guest with the given ID via the API
 * @param {string | number} id
 */
async function removeGuest(id) {
  try {
    await fetch(API + "/guests/" + id, {
      method: "DELETE"
    });
    await getGuests();
  } catch (err) {
    console.error(err);
  }
}

async function removeParty(id) {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Delete failed:", errorBody);
      return;
    }
    selectedParty = null;
    await getParties();
  } catch (err) {
    console.error(err);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button id="delete-party">Delete Party</button>
    <GuestList></GuestList>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());
  
  const $deleteButton = $party.querySelector("#delete-party");
  $deleteButton.addEventListener("click", () => removeParty(selectedParty.id));
  
  return $party;
}
function PartyForm() {
  const $form = document.createElement("form");
  $form.innerHTML = `
    <label>
      Name
      <input name="name" type="text" required />
    </label>
    <label>
      Description
      <input name="description" type="text" required />
    </label>
    <label>
      Date
      <input name="date" type="date" required />
    </label>
    <label>
      Location
      <input name="location" type="text" required />
    </label>
    <button type="submit">Add Party</button>
  `;

  $form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData($form);
    addParty({
      name: formData.get("name"),
      description: formData.get("description"),
      date: new Date(formData.get("date")).toISOString(),
      location: formData.get("location"),
    });
    $form.reset();
  });
  return $form;
}
/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map(GuestListItem);
  $ul.replaceChildren(...$guests);

  return $ul;
}



function GuestListItem(guest) {
  const $li = document.createElement("li");
  $li.textContent = guest.name;

  const $removeButton = document.createElement("button");
  $removeButton.textContent = "Remove";
  $removeButton.addEventListener("click", () => removeGuest(guest.id));
  $li.append($removeButton);

  return $li;
}


// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <h2>Add a Party</h2>
        <PartyForm></PartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("PartyForm").replaceWith(PartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
