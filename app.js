const SUPABASE_URL = "https://bspemalirnvoomqtgwjd.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_Wvv2VOeFPJbrq92p5M0vAA_1uqt5E3J";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// Loads all saved appliances from the Supabase database
async function loadAppliances() {
  // Request all appliance records from the appliances table.
  // Sort them so the newest appliances appear first.
  const {
    data: savedAppliances,
    error
  } = await supabaseClient
    .from("appliances")
    .select("*")
    .order("created_at", { ascending: false });

  // If Supabase returns an error, display an error message
  // and stop the function.
if (error) {
    console.error("Supabase error:", error);
    showToast("Error", error.message);
    return;
}

  // Convert the database records into the format
  // expected by the frontend appliance cards.
  appliances = savedAppliances.map(appliance => ({
    // Copy the appliance ID from the database.
    id: appliance.appliance_id,

    // Copy the appliance information from the database.
    name: appliance.name,
    type: appliance.type,
    brand: appliance.brand || "Unknown brand",
    model: appliance.model || "Model not added",
    category: appliance.category,

    // Format the last maintenance date.
    // If no date exists, display a default message.
    last: appliance.last_maintenance_date
      ? formatDate(appliance.last_maintenance_date).full
      : "Not yet serviced",

    // These values are used by the current frontend design.
    next: "Set a reminder",
    status: "Up to date",
    icon: "▤",
    tone: "",

    // Format the purchase date.
    // If no purchase date exists, display a default message.
    purchase: appliance.purchase_date
      ? formatDate(appliance.purchase_date).full
      : "Recently added"
  }));

  // Refresh the appliance cards so the saved database records
  // are displayed on the page.
  renderAppliances();
}

const pages = ['home','maintenance','appliances','appliance-details','professionals','professional-profile','assistant'];
const pageNames = {home:'Overview',maintenance:'Maintenance Log',appliances:'My Appliances','appliance-details':'Appliance Details',professionals:'Professionals','professional-profile':'Professional Profile',assistant:'Maintenance Max'};
let currentPage = 'home';
let selectedAppliance = null;
let events = [
  {name:'Replace HVAC Filter', category:'HVAC', date:'2026-09-30', time:'9:00 AM', description:'Replace the filter to keep air quality fresh.', status:'Upcoming'},
  {name:'Clean Dryer Vent', category:'Laundry', date:'2026-10-03', time:'10:30 AM', description:'Clear lint buildup and inspect the vent line.', status:'Upcoming'},
  {name:'Refrigerator Filter', category:'Kitchen', date:'2026-10-14', time:'9:00 AM', description:'Replace the water and ice filter.', status:'Upcoming'},
  {name:'Water Heater Inspection', category:'Plumbing', date:'2026-10-22', time:'2:00 PM', description:'Annual inspection and pressure relief check.', status:'Upcoming'},
  {name:'Test Smoke Detectors', category:'General', date:'2026-09-12', time:'11:00 AM', description:'Test each detector and replace batteries as needed.', status:'Completed'}
];
let appliances = [];
const professionals = [
  {name:'Evergreen Home Services', logo:'E', rating:'4.9', reviews:'128 reviews', distance:'1.8 mi', availability:'Today at 4:30 PM', description:'Friendly appliance repair from a trusted local team.', category:'Appliance specialist'},
  {name:'FixRight Appliance Co.', logo:'F', rating:'4.8', reviews:'96 reviews', distance:'3.2 mi', availability:'Tomorrow at 9:00 AM', description:'Fast, honest repairs for all major appliance brands.', category:'Appliance repair'},
  {name:'Boulder Handy Home', logo:'B', rating:'4.7', reviews:'74 reviews', distance:'4.5 mi', availability:'Fri, Oct 3', description:'Home maintenance and preventative care made easy.', category:'General home repair'}
];

const $ = (selector, parent=document) => parent.querySelector(selector);
const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];
const formatDate = (dateString) => { const d = new Date(`${dateString}T12:00:00`); return {month:d.toLocaleString('en-US',{month:'short'}).toUpperCase(), day:d.getDate(), full:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}; };

function navigate(page, updateHistory = true) {
  if (!pages.includes(page)) page = 'home';

  if (updateHistory && location.hash !== `#${page}`) {
    history.pushState(null, '', `#${page}`);
  }

  currentPage = page;
  pages.forEach(p => $(`#page-${p}`)?.classList.toggle('active-page', p === page));
  $$('.nav-item').forEach(item =>
    item.classList.toggle(
      'active',
      item.dataset.page === page ||
      (page === 'appliance-details' && item.dataset.page === 'appliances') ||
      (page === 'professional-profile' && item.dataset.page === 'professionals')
    )
  );
  $('#breadcrumbs').innerHTML =
    `<span>Home</span><span class="crumb-separator">/</span><strong>${pageNames[page]}</strong>`;
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (page === 'maintenance') {
    renderCalendar();
    renderEvents();
  }
  if (page === 'appliances') renderAppliances();
  if (page === 'professionals') renderProfessionals();
}

function showToast(title, message){ $('#toastTitle').textContent=title; $('#toastMessage').textContent=message; $('#toast').classList.add('show'); setTimeout(()=>$('#toast').classList.remove('show'),3200); }
function openModal(id){ $(`#${id}`).classList.add('open'); }
function closeModal(id){ $(`#${id}`).classList.remove('open'); }
function statusClass(status){ return status === 'Up to date' || status === 'Completed' ? 'green' : status === 'Overdue' ? 'orange' : 'gray'; }

function renderMiniEvents(){
  $('#miniEventList').innerHTML = events.filter(e=>e.status !== 'Completed').slice(0,3).map(e=>{const d=formatDate(e.date);return `<div class="mini-event"><div class="event-date"><span>${d.month}</span><b>${d.day}</b></div><div class="mini-event-info"><strong>${e.name}</strong><span>${e.time} · ${e.category}</span></div><span class="event-category">Upcoming</span></div>`}).join('');
}
function renderCalendar(){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const first = new Date(2026,8,1).getDay();
  const daysInMonth = 30;
  const cells = days.map(d=>`<div class="calendar-day-name">${d}</div>`);
  for(let i=0;i<first;i++) cells.push('<div class="calendar-cell muted-day"></div>');
  for(let day=1;day<=daysInMonth;day++){
    const iso=`2026-09-${String(day).padStart(2,'0')}`;
    const dayEvents=events.filter(e=>e.date===iso);
    cells.push(`<div class="calendar-cell ${day===30?'today':''}"><span class="day-number">${day}</span>${dayEvents.map((e,i)=>`<span class="calendar-event ${i%3===1?'peach-event':i%3===2?'purple-event':''}" title="${e.description}">${e.name}</span>`).join('')}</div>`);
  }
  while(cells.length<49) cells.push('<div class="calendar-cell muted-day"></div>');
  $('#calendarGrid').innerHTML=cells.join('');
  renderMiniEvents();
}
function renderEvents(){
  const sorted=[...events].sort((a,b)=>a.date.localeCompare(b.date));
  $('#eventList').innerHTML=sorted.map((e,index)=>{const d=formatDate(e.date);return `<div class="event-card"><div class="event-card-date"><span>${d.month}</span><b>${d.day}</b></div><div class="event-card-body"><strong>${e.name}</strong><small>${e.category} · ${e.time}</small><p class="event-description">${e.description}</p></div><span class="status-pill ${statusClass(e.status)}">${e.status}</span>${e.status!=='Completed'?`<button class="event-complete" data-complete="${events.indexOf(e)}" title="Mark completed">✓</button>`:'<span class="event-complete">✓</span>'}</div>`}).join('');
  $$('[data-complete]').forEach(btn=>btn.addEventListener('click',()=>{events[Number(btn.dataset.complete)].status='Completed'; renderEvents(); renderCalendar(); showToast('Task completed','Nice work keeping your home on track.');}));
}
function iconFor(a){return `<div class="appliance-icon ${a.tone}">${a.icon}</div>`}
function renderAppliances(){
  const query=($('#applianceSearch').value||'').toLowerCase(); const category=$('#categoryFilter').value;
  const filtered=appliances.filter(a=>(category==='all'||a.category===category)&&[a.name,a.type,a.brand,a.category].join(' ').toLowerCase().includes(query));
  $('#applianceCount').textContent=`${filtered.length} appliance${filtered.length===1?'':'s'}`;
  $('#applianceGrid').innerHTML=filtered.length ? filtered.map(a=>`<article class="appliance-card" data-appliance-card="${a.name}"><div class="appliance-card-top">${iconFor(a)}<span class="status-pill ${statusClass(a.status)}">${a.status}</span></div><h3>${a.name}</h3><span class="category">${a.brand} · ${a.category}</span><div class="appliance-dates"><div><span>Last maintenance</span><strong>${a.last}</strong></div><div><span>Next recommended</span><strong>${a.next}</strong></div><span class="appliance-arrow">→</span></div></article>`).join('') : '<div class="empty-state">No appliances match your search.</div>';
  $$('[data-appliance-card]').forEach(card=>card.addEventListener('click',()=>openAppliance(card.dataset.applianceCard)));
}
function openAppliance(name){ selectedAppliance=appliances.find(a=>a.name===name)||appliances[0]; $('#detailName').textContent=selectedAppliance.name; $('#detailMeta').textContent=`${selectedAppliance.brand} · ${selectedAppliance.model} · Purchased ${selectedAppliance.purchase}`; $('#detailIcon').className=`appliance-large-icon ${selectedAppliance.tone}`; $('#detailIcon').textContent=selectedAppliance.icon; $('#detailLast').textContent=selectedAppliance.last; $('#detailNext').textContent=selectedAppliance.next; $('#detailStatus').textContent=selectedAppliance.status; $('#detailStatus').className=`status-pill ${statusClass(selectedAppliance.status)}`; navigate('appliance-details'); }
function renderProfessionals(){
  $('#professionalList').innerHTML=professionals.map((p,i)=>`<article class="pro-card ${i===0?'selected':''}"><div class="pro-top"><div class="pro-logo">${p.logo}</div><div><h3>${p.name}</h3><div class="pro-rating">★ ${p.rating}<span>${p.reviews}</span></div></div></div><p class="pro-description">${p.description}</p><div class="pro-meta"><span>${p.category}</span><span>${p.distance}</span><span>${p.availability}</span></div><div class="pro-actions"><button class="outline-button" data-profile="${p.name}">View profile</button><button class="soft-button" data-book="${p.name}">Select time</button></div></article>`).join('');
  $$('[data-profile]').forEach(btn=>btn.addEventListener('click',()=>navigate('professional-profile')));
  $$('[data-book]').forEach(btn=>btn.addEventListener('click',()=>{navigate('professional-profile');setTimeout(()=>showToast('Professional selected','Choose an available appointment time.'),250);}));
}
function addChatMessage(text, type){
  let list=$('#chatMessageList'); if(!list){ $('#chatWelcome').remove(); list=document.createElement('div'); list.id='chatMessageList'; list.className='chat-message-list'; $('#chatWindow').appendChild(list); }
  const row=document.createElement('div'); row.className=`chat-message ${type}`; row.innerHTML=type==='max'?`<span class="max-avatar">✦</span><div class="chat-bubble">${text}</div>`:`<div class="chat-bubble">${text}</div>`; list.appendChild(row); $('#chatWindow').scrollTop=$('#chatWindow').scrollHeight;
}
function askMax(text){
  addChatMessage(text,'user'); setTimeout(()=>{let response='I can help with that. Tell me a little more about what you’re noticing, and I’ll walk through safe next steps.'; if(text.toLowerCase().includes('refrigerator')) response='For a buzzing refrigerator, first check that it is level and has a little space from the wall. The sound may come from the condenser fan, evaporator fan, or ice maker. If it is unusually loud, paired with warming food, or involves exposed wiring, unplug the appliance and contact a licensed technician.'; if(text.toLowerCase().includes('appliance')) response=`I can help with your ${selectedAppliance?.name||'appliances'}. What would you like to know about its maintenance or symptoms?`; if(text.toLowerCase().includes('professional')) response='I found trusted local professionals who can help. Open the Professionals page to compare availability, ratings, and services.'; addChatMessage(response,'max');},450);
}

document.addEventListener('click', e=>{ const pageTarget=e.target.closest('[data-page]'); if(pageTarget){e.preventDefault();navigate(pageTarget.dataset.page);} const close=e.target.closest('[data-close]'); if(close)closeModal(close.dataset.close); if(e.target.classList.contains('modal-backdrop'))e.target.classList.remove('open'); });

window.addEventListener('popstate', () => {
  navigate(location.hash.slice(1) || 'home', false);
});

$('#menuButton').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#openEventModal').addEventListener('click',()=>openModal('eventModal')); $('#floatingAdd').addEventListener('click',()=>openModal('eventModal'));
$('#openApplianceModal').addEventListener('click',()=>openModal('applianceModal'));
$$('.segment').forEach(btn=>btn.addEventListener('click',()=>{$$('.segment').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#calendarView').classList.toggle('hidden',btn.dataset.view!=='calendar');$('#listView').classList.toggle('hidden',btn.dataset.view!=='list');}));
$('#eventForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);events.push({name:data.get('name'),category:data.get('category'),date:data.get('date'),time:new Date(`2026-01-01T${data.get('time')||'09:00'}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),description:data.get('description')||'A new home maintenance reminder.',status:'Upcoming'});e.target.reset();closeModal('eventModal');renderCalendar();renderEvents();showToast('Event added','Your maintenance reminder is on the calendar.');});

// Runs when the user submits the Add Appliance form
$("#applianceForm").addEventListener("submit", async event => {
  // Prevents the browser from refreshing the page automatically
  event.preventDefault();

  // Collects all of the values entered into the form
  const formData = new FormData(event.target);



  // Creates an object using the form values.
  // The property names must match the column names
  // in the Supabase appliances table.
  const applianceToInsert = {
    name: formData.get("name"),
    type: formData.get("type"),
    brand: formData.get("brand") || null,
    model: formData.get("model") || null,
    category: formData.get("category"),
    purchase_date: formData.get("purchase") || null,
    last_maintenance_date: formData.get("last") || null
  };

  // Sends the new appliance to Supabase.
  // insert() adds the row to the database.
  // select() asks Supabase to return the inserted row.
  // single() converts the returned array into one object.
  const {
    data: savedAppliance,
    error
  } = await supabaseClient
    .from("appliances")
    .insert(applianceToInsert)
    .select()
    .single();

  // Displays an error if the database request failed
  if (error) {
    console.error(error);

    showToast(
      "Error",
      "The appliance could not be saved."
    );

    return;
  }

  // Converts the database record into the format
  // expected by the existing appliance cards.
  const applianceForUI = {
    id: savedAppliance.appliance_id,
    name: savedAppliance.name,
    type: savedAppliance.type,
    brand: savedAppliance.brand || "Unknown brand",
    model: savedAppliance.model || "Model not added",
    category: savedAppliance.category,

    last: savedAppliance.last_maintenance_date
      ? formatDate(savedAppliance.last_maintenance_date).full
      : "Not yet serviced",

    next: "Set a reminder",
    status: "Up to date",
    icon: "▤",
    tone: "",

    purchase: savedAppliance.purchase_date
      ? formatDate(savedAppliance.purchase_date).full
      : "Recently added"
  };

  // Adds the saved appliance to the frontend array.
  // unshift() places it at the beginning of the list.
  appliances.unshift(applianceForUI);

  // Redraws the appliance cards so the new appliance appears
  // immediately without requiring another page refresh.
  renderAppliances();

  // Clears the form fields
  event.target.reset();

  // Closes the Add Appliance modal
  closeModal("applianceModal");

  // Shows a success message to the user
  showToast(
    "Appliance added",
    "Your appliance was saved successfully."
  );
});
$('#applianceSearch').addEventListener('input',renderAppliances); $('#categoryFilter').addEventListener('change',renderAppliances);
$('#askMaxButton').addEventListener('click',()=>{navigate('assistant');setTimeout(()=>{if(selectedAppliance) askMax(`I have a question about my ${selectedAppliance.name}.`);},100);});
$$('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>{const p=btn.dataset.prompt;if(p==='Ask About an Appliance'){addChatMessage('Which appliance would you like to ask about?','max');}else{askMax(p);}}));
$$('[data-appliance]').forEach(btn=>btn.addEventListener('click',()=>askMax(`I have a question about my ${btn.dataset.appliance}.`)));
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const input=$('#chatInput');if(input.value.trim()){askMax(input.value.trim());input.value='';}});
$$('.category-chip').forEach(btn=>btn.addEventListener('click',()=>{$$('.category-chip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}));
$('#findProfessionals').addEventListener('click',()=>{renderProfessionals();showToast('Search updated','Showing trusted professionals near you.');});
$('#bookService').addEventListener('click',()=>{navigate('professional-profile');showToast('Ready to book','Choose a date and time below.');});
$$('.date-option').forEach(btn=>btn.addEventListener('click',()=>{$$('.date-option').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}));
$$('.time-options button').forEach(btn=>btn.addEventListener('click',()=>{$$('.time-options button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');}));
$('#selectTime').addEventListener('click',()=>showToast('Appointment selected','Evergreen Home Services will confirm shortly.'));
$$('#starInput button').forEach((btn,i)=>btn.addEventListener('click',()=>$$('#starInput button').forEach((b,j)=>b.classList.toggle('selected',j<=i))));
$('#submitReview').addEventListener('click',()=>showToast('Review submitted','Thanks for sharing your experience.'));

navigate(location.hash.slice(1) || 'home', false);
renderCalendar();
renderEvents();
renderMiniEvents();
renderProfessionals();

// ====================================
// ACCOUNT SETTINGS - SUPABASE
// ====================================

// The currently signed-in user's account information
let currentAccountUser = null;


// ====================================
// LOAD ACCOUNT INFORMATION
// ====================================

async function loadAccount() {

  // Get the currently authenticated user
  const { data, error } = await supabaseClient.auth.getUser();

  if (error || !data.user) {
    console.error("Unable to load account:", error);
    return;
  }

  currentAccountUser = data.user;

  updateAccountDisplay();
}


// ====================================
// UPDATE NAME THROUGHOUT THE APP
// ====================================

function updateAccountDisplay() {

  if (!currentAccountUser) return;

  // Retrieve the first name from Supabase metadata
  const firstName =
    currentAccountUser.user_metadata?.first_name || "";

  // Use a friendly placeholder if no name exists
  const displayName = firstName || "Your Name";
  const greetingName = firstName || "there";

  // Sidebar
  $("#sidebarUsername").textContent = displayName;

  // Homepage greeting
  $("#homeUsername").textContent = greetingName;

  // Maintenance Max greeting
  const maxUsername = $("#maxUsername");

  if (maxUsername) {
    maxUsername.textContent = greetingName;
  }

  // Profile initials
  const initial = firstName
    ? firstName.charAt(0).toUpperCase()
    : "?";

  $(".avatar-small").textContent = initial;
  $(".top-avatar").textContent = initial;
}


// ====================================
// OPEN ACCOUNT SETTINGS
// ====================================

$("#accountSettingsButton").addEventListener("click", async () => {

  // Refresh account information from Supabase
  await loadAccount();

  if (!currentAccountUser) {
    showToast("Error", "Please sign in again.");
    return;
  }

  // Fill form with current account information
  $("#accountFirstName").value =
    currentAccountUser.user_metadata?.first_name || "";

  $("#accountEmail").value =
    currentAccountUser.email || "";

  $("#accountZip").value =
    currentAccountUser.user_metadata?.zip_code || "";

  // Never display an existing password
  $("#accountPassword").value = "";
  $("#accountConfirmPassword").value = "";

  openModal("accountModal");
});


// ====================================
// SAVE ACCOUNT SETTINGS
// ====================================

$("#accountForm").addEventListener("submit", async event => {

  event.preventDefault();

  if (!currentAccountUser) {
    showToast("Error", "Please sign in again.");
    return;
  }

  // Retrieve input values
  const firstName = $("#accountFirstName").value.trim();
  const email = $("#accountEmail").value.trim();
  const zipCode = $("#accountZip").value.trim();

  const password = $("#accountPassword").value;
  const confirmPassword = $("#accountConfirmPassword").value;

  // Validate first name
  if (!firstName) {
    showToast("Invalid Name", "Please enter your first name.");
    return;
  }

  // Validate ZIP code
  if (!/^[0-9]{5}$/.test(zipCode)) {
    showToast("Invalid ZIP Code", "Enter a five-digit ZIP code.");
    return;
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    showToast("Password Error", "Passwords do not match.");
    return;
  }

  if (password && password.length < 8) {
    showToast("Password Error", "Use at least eight characters.");
    return;
  }

  // Disable save button while updating
  const saveButton = event.target.querySelector(
    'button[type="submit"]'
  );

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  try {

    // ====================================
    // UPDATE FIRST NAME AND ZIP CODE
    // ====================================

    const { error: profileError } =
      await supabaseClient.auth.updateUser({
        data: {
          first_name: firstName,
          zip_code: zipCode
        }
      });

    if (profileError) {
      throw profileError;
    }

    // ====================================
    // UPDATE EMAIL IF CHANGED
    // ====================================

    const emailChanged =
      email !== currentAccountUser.email;

    if (emailChanged) {

      const { error: emailError } =
        await supabaseClient.auth.updateUser({
          email: email
        });

      if (emailError) {
        throw emailError;
      }
    }

    // ====================================
    // UPDATE PASSWORD IF PROVIDED
    // ====================================

    if (password) {

      const { error: passwordError } =
        await supabaseClient.auth.updateUser({
          password: password
        });

      if (passwordError) {
        throw passwordError;
      }
    }

    // Refresh account information
    await loadAccount();

    // Clear password fields
    $("#accountPassword").value = "";
    $("#accountConfirmPassword").value = "";

    closeModal("accountModal");

    if (emailChanged) {

      showToast(
        "Account Updated",
        "Check your email for any required confirmation."
      );

    } else {

      showToast(
        "Account Updated",
        "Your account information has been saved."
      );

    }

  } catch (error) {

    console.error("Account update error:", error);

    showToast(
      "Update Error",
      error.message || "Unable to update account."
    );

    // Earlier updates may have succeeded, so refresh the user.
    await loadAccount();

  } finally {

    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";

  }

});

// ====================================
// DELETE ACCOUNT
// ====================================
 const confirmDeleteButton = document.getElementById("confirmDeleteAccountButton");
deleteAccountButton.addEventListener("click", () => {
  deleteConfirmationInput.value = "";
  confirmDeleteButton.disabled = true;
 

  // Close Account Settings
  closeModal("accountModal");

  // Open the delete confirmation popup
  openModal("deleteAccountModal");

  // Make sure the confirmation input receives focus
  deleteConfirmationInput.focus();
});

// Enable deletion only when the user types DELETE
deleteConfirmationInput.addEventListener("input", () => {
  confirmDeleteButton.disabled =
    deleteConfirmationInput.value !== "DELETE";
});

// Delete the authenticated user's account
confirmDeleteButton.addEventListener("click", async () => {
  if (deleteConfirmationInput.value !== "DELETE") return;

  confirmDeleteButton.disabled = true;
  confirmDeleteButton.textContent = "Deleting...";

  try {
    const { data: sessionData, error: sessionError } =
      await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error("Please sign in again.");
    }

    const { data, error } = await supabaseClient.functions.invoke(
      "delete-account",
      {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        }
      }
    );

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || "Account deletion failed.");
    }

    // Clear the local authentication session
    await supabaseClient.auth.signOut({ scope: "local" });

    // Return to the sign-in screen
    closeModal("deleteAccountModal");

    currentAccountUser = null;

    appShell.style.display = "none";
    loginPage.style.display = "flex";
    loginForm.reset();

    showToast("Account Deleted", "Your account has been deleted.");

  } catch (error) {
    console.error("Account deletion error:", error);
    showToast(
      "Deletion Failed",
      error.message || "Please try again."
    );
  } finally {
    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = "Permanently Delete Account";
  }
});

// ====================================
// USER LOGIN
// ====================================

const loginForm = document.querySelector("#loginForm");
const loginPage = document.querySelector("#loginPage");
const appShell = document.querySelector(".app-shell");
const loginMessage = document.querySelector("#loginMessage");

// Show the main application after successful login
async function showMainApp() {

  loginPage.style.display = "none";
  appShell.style.display = "flex";

  // Load the signed-in user's account information
  await loadAccount();

  await loadAppliances();

}

// Handle user sign in
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  loginMessage.textContent = "Signing in...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    loginMessage.textContent = error.message;
    return;
  }

  if (data.user) {
    loginMessage.textContent = "";
    showMainApp();
  }
});
// Switch between Sign In and Sign Up
const signupForm = document.querySelector("#signupForm");
const showSignupButton = document.querySelector("#showSignupButton");
const backToLoginButton = document.querySelector("#backToLoginButton");

showSignupButton.addEventListener("click", () => {
  loginForm.style.display = "none";
  signupForm.style.display = "flex";
  showSignupButton.parentElement.style.display = "none";
  loginMessage.style.display = "none";
});

backToLoginButton.addEventListener("click", () => {
  signupForm.style.display = "none";
  loginForm.style.display = "flex";
  showSignupButton.parentElement.style.display = "";
  loginMessage.style.display = "";
});
// Register a new Havenly user with Supabase
signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#signupEmail").value.trim();
  const password = document.querySelector("#signupPassword").value;
  const usernameValue = document.querySelector("#signupUsername").value.trim();
  const signupMessage = document.querySelector("#signupMessage");

  signupMessage.textContent = "Creating your account...";

  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
    options: { data: { username: usernameValue } }
  });

  if (error) {
    signupMessage.textContent = error.message;
    return;
  }

  if (data.session) {
    signupMessage.textContent = "";
    showMainApp();
  } else {
    signupMessage.textContent =
      "Account created! Please check your email to confirm your account, then sign in.";
  }
});
// Keep the user signed in after refreshing the page
async function checkLoginSession() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    return;
  }

  if (data.session) {
    showMainApp();
  }
}

// Check login status when the page loads
checkLoginSession();
// Sign out
const signOutButton = document.querySelector("#signOutButton");

signOutButton.addEventListener("click", async () => {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Sign out failed: " + error.message);
    return;
  }

  // Clear the previous user's account information
currentAccountUser = null;
appliances = [];
renderAppliances();

// Reset displayed account information
$("#sidebarUsername").textContent = "Your Name";
$("#homeUsername").textContent = "there";

const maxUsername = $("#maxUsername");

if (maxUsername) {
  maxUsername.textContent = "there";
}

$(".avatar-small").textContent = "?";
$(".top-avatar").textContent = "?";

  appShell.style.display = "none";
  loginPage.style.display = "flex";
  loginForm.reset();
});