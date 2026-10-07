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
let appliances = [
  {name:'Samsung Smart Refrigerator', type:'Refrigerator', brand:'Samsung', model:'RF28T5001SR', category:'Kitchen', last:'Aug 15, 2026', next:'Nov 15, 2026', status:'Up to date', icon:'▤', tone:'', purchase:'May 2022'},
  {name:'Whirlpool Front Load Washer', type:'Washer', brand:'Whirlpool', model:'WFW5620HW', category:'Laundry', last:'Jul 04, 2026', next:'Oct 04, 2026', status:'Maintenance soon', icon:'◉', tone:'laundry', purchase:'Mar 2021'},
  {name:'GE Electric Dryer', type:'Dryer', brand:'GE', model:'GFD55ESSNWW', category:'Laundry', last:'Jun 19, 2026', next:'Dec 19, 2026', status:'Up to date', icon:'◌', tone:'laundry', purchase:'Mar 2021'},
  {name:'Carrier HVAC System', type:'HVAC System', brand:'Carrier', model:'24ACC636W003', category:'HVAC', last:'Jun 22, 2026', next:'Oct 22, 2026', status:'Maintenance soon', icon:'♨', tone:'hvac', purchase:'Apr 2020'},
  {name:'Rheem Water Heater', type:'Water Heater', brand:'Rheem', model:'XE50T10HD50U1', category:'Plumbing', last:'Jan 12, 2026', next:'Jul 12, 2026', status:'Overdue', icon:'♧', tone:'plumbing', purchase:'Nov 2019'}
];
const professionals = [
  {name:'Evergreen Home Services', logo:'E', rating:'4.9', reviews:'128 reviews', distance:'1.8 mi', availability:'Today at 4:30 PM', description:'Friendly appliance repair from a trusted local team.', category:'Appliance specialist'},
  {name:'FixRight Appliance Co.', logo:'F', rating:'4.8', reviews:'96 reviews', distance:'3.2 mi', availability:'Tomorrow at 9:00 AM', description:'Fast, honest repairs for all major appliance brands.', category:'Appliance repair'},
  {name:'Boulder Handy Home', logo:'B', rating:'4.7', reviews:'74 reviews', distance:'4.5 mi', availability:'Fri, Oct 3', description:'Home maintenance and preventative care made easy.', category:'General home repair'}
];

const $ = (selector, parent=document) => parent.querySelector(selector);
const $$ = (selector, parent=document) => [...parent.querySelectorAll(selector)];
const formatDate = (dateString) => { const d = new Date(`${dateString}T12:00:00`); return {month:d.toLocaleString('en-US',{month:'short'}).toUpperCase(), day:d.getDate(), full:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}; };

function navigate(page){
  if(!pages.includes(page)) page = 'home';
  currentPage = page;
  pages.forEach(p => $(`#page-${p}`)?.classList.toggle('active-page', p === page));
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === page || (page === 'appliance-details' && item.dataset.page === 'appliances') || (page === 'professional-profile' && item.dataset.page === 'professionals')));
  $('#breadcrumbs').innerHTML = `<span>Home</span><span class="crumb-separator">/</span><strong>${pageNames[page]}</strong>`;
  $('#sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  if(page === 'maintenance'){ renderCalendar(); renderEvents(); }
  if(page === 'appliances') renderAppliances();
  if(page === 'professionals') renderProfessionals();
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
$('#menuButton').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#openEventModal').addEventListener('click',()=>openModal('eventModal')); $('#floatingAdd').addEventListener('click',()=>openModal('eventModal'));
$('#openApplianceModal').addEventListener('click',()=>openModal('applianceModal'));
$$('.segment').forEach(btn=>btn.addEventListener('click',()=>{$$('.segment').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#calendarView').classList.toggle('hidden',btn.dataset.view!=='calendar');$('#listView').classList.toggle('hidden',btn.dataset.view!=='list');}));
$('#eventForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);events.push({name:data.get('name'),category:data.get('category'),date:data.get('date'),time:new Date(`2026-01-01T${data.get('time')||'09:00'}`).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),description:data.get('description')||'A new home maintenance reminder.',status:'Upcoming'});e.target.reset();closeModal('eventModal');renderCalendar();renderEvents();showToast('Event added','Your maintenance reminder is on the calendar.');});
$('#applianceForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);const name=data.get('name');appliances.push({name,type:data.get('type'),brand:data.get('brand')||'New appliance',model:data.get('model')||'Model not added',category:data.get('category'),last:data.get('last')?formatDate(data.get('last')).full:'Not yet serviced',next:'Set a reminder',status:'Up to date',icon:'▤',tone:'',purchase:data.get('purchase')?formatDate(data.get('purchase')).full:'Recently added'});e.target.reset();closeModal('applianceModal');renderAppliances();showToast('Appliance added','You can now track its maintenance history.');});
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
renderCalendar(); renderEvents(); renderMiniEvents(); renderAppliances(); renderProfessionals();
