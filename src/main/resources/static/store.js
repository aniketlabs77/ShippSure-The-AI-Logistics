/* =========================================================
   AI LOGISTICS — mock data store (localStorage)
   Simulates a backend so every page works standalone.
   ========================================================= */

const DB_KEY = 'ail_db_v1';

function uid(prefix){
  return prefix + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

function seed(){
  return {
    customers: [
      { id:'cust-1', name:'Ritika Sharma', email:'ritika@example.com', phone:'9876500001', password:'demo123' }
    ],
    drivers: [
      { id:'drv-1', name:'Arjun Mehta', email:'arjun@example.com', phone:'9876500002', password:'demo123', vehicle:'Mini Truck', license:'DL-04-2021-0093211', status:'approved' },
      { id:'drv-2', name:'Suresh Kumar', email:'suresh@example.com', phone:'9876500003', password:'demo123', vehicle:'Two Wheeler', license:'DL-09-2019-0041872', status:'pending' },
      { id:'drv-3', name:'Farhan Ali', email:'farhan@example.com', phone:'9876500004', password:'demo123', vehicle:'Container Truck', license:'DL-01-2018-0072311', status:'pending' },
      { id:'drv-4', name:'Meena Iyer', email:'meena@example.com', phone:'9876500005', password:'demo123', vehicle:'Van', license:'DL-07-2020-0028841', status:'approved' },
      { id:'drv-5', name:'Ramesh Yadav', email:'ramesh@example.com', phone:'9876500006', password:'demo123', vehicle:'Mini Truck', license:'DL-03-2017-0091432', status:'rejected' }
    ],
    admins: [
      { id:'adm-1', name:'Admin', email:'admin@ailogistics.com', password:'admin123' }
    ],
    shipments: [
      {
        id:'SHP-10234', customerId:'cust-1', driverId:'drv-1',
        pickup:'Sector 62, Noida, UP', drop:'Connaught Place, New Delhi',
        weightKg:180, length:120, width:80, height:90,
        goods:'Packaged electronics (cartons)',
        vehicle:'Mini Truck', status:'delivered',
        createdAt:'2026-08-18T09:20:00', eta:'2026-08-18T15:00:00',
        history:[
          {label:'Shipment booked', time:'2026-08-18T09:20:00', done:true},
          {label:'Driver assigned — Arjun Mehta', time:'2026-08-18T09:45:00', done:true},
          {label:'Picked up from origin', time:'2026-08-18T10:30:00', done:true},
          {label:'In transit', time:'2026-08-18T12:10:00', done:true},
          {label:'Delivered', time:'2026-08-18T14:52:00', done:true}
        ]
      },
      {
        id:'SHP-10255', customerId:'cust-1', driverId:'drv-1',
        pickup:'Sector 18, Noida, UP', drop:'Karol Bagh, New Delhi',
        weightKg:45, length:60, width:40, height:35,
        goods:'Garments (boxed)',
        vehicle:'Two Wheeler', status:'in_transit',
        createdAt:'2026-08-21T07:10:00', eta:'2026-08-21T13:00:00',
        history:[
          {label:'Shipment booked', time:'2026-08-21T07:10:00', done:true},
          {label:'Driver assigned — Arjun Mehta', time:'2026-08-21T07:25:00', done:true},
          {label:'Picked up from origin', time:'2026-08-21T08:40:00', done:true},
          {label:'In transit', time:'2026-08-21T09:15:00', done:true},
          {label:'Delivered', time:null, done:false}
        ]
      },
      {
        id:'SHP-10261', customerId:'cust-1', driverId:null,
        pickup:'Greater Noida, UP', drop:'Gurugram, Haryana',
        weightKg:920, length:200, width:150, height:140,
        goods:'Industrial spare parts (crated)',
        vehicle:'Container Truck', status:'pending',
        createdAt:'2026-08-21T08:05:00', eta:null,
        history:[
          {label:'Shipment booked', time:'2026-08-21T08:05:00', done:true},
          {label:'Awaiting driver assignment', time:null, done:false},
          {label:'Picked up from origin', time:null, done:false},
          {label:'In transit', time:null, done:false},
          {label:'Delivered', time:null, done:false}
        ]
      },
      {
        id:'SHP-10199', customerId:'cust-1', driverId:'drv-4',
        pickup:'Noida Extension, UP', drop:'Lajpat Nagar, New Delhi',
        weightKg:12, length:30, width:20, height:15,
        goods:'Documents & small parcel',
        vehicle:'Two Wheeler', status:'cancelled',
        createdAt:'2026-08-15T11:00:00', eta:null,
        history:[
          {label:'Shipment booked', time:'2026-08-15T11:00:00', done:true},
          {label:'Driver assigned — Meena Iyer', time:'2026-08-15T11:20:00', done:true},
          {label:'Cancelled by customer', time:'2026-08-15T12:05:00', done:true}
        ]
      }
    ],
    session: null
  };
}

function loadDB(){
  let raw = localStorage.getItem(DB_KEY);
  if(!raw){
    const s = seed();
    localStorage.setItem(DB_KEY, JSON.stringify(s));
    return s;
  }
  try{ return JSON.parse(raw); } catch(e){ const s = seed(); localStorage.setItem(DB_KEY, JSON.stringify(s)); return s; }
}
function saveDB(db){ localStorage.setItem(DB_KEY, JSON.stringify(db)); }

const Store = {
  db(){ return loadDB(); },

  // ---- session ----
  login(role, email, password){
    const db = loadDB();
    const table = role === 'customer' ? db.customers : role === 'driver' ? db.drivers : db.admins;
    const user = table.find(u => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password);
    if(!user) return { ok:false, message:'Invalid email or password.' };
    if(role === 'driver' && user.status !== 'approved'){
      return { ok:false, message: user.status === 'pending'
        ? 'Your driver account is awaiting admin approval.'
        : 'Your driver account has been rejected. Contact admin support.' };
    }
    db.session = { role, id:user.id, name:user.name, email:user.email };
    saveDB(db);
    return { ok:true, user: db.session };
  },
  registerCustomer(data){
    const db = loadDB();
    if(db.customers.some(c => c.email.toLowerCase() === data.email.toLowerCase())){
      return { ok:false, message:'An account with this email already exists.' };
    }
    const user = { id: uid('cust'), status:'active', ...data };
    db.customers.push(user);
    db.session = { role:'customer', id:user.id, name:user.name, email:user.email };
    saveDB(db);
    return { ok:true, user: db.session };
  },
  registerDriver(data){
    const db = loadDB();
    if(db.drivers.some(d => d.email.toLowerCase() === data.email.toLowerCase())){
      return { ok:false, message:'An account with this email already exists.' };
    }
    const user = { id: uid('drv'), status:'pending', ...data };
    db.drivers.push(user);
    saveDB(db);
    return { ok:true, user };
  },
  logout(){ const db = loadDB(); db.session = null; saveDB(db); },
  session(){ return loadDB().session; },
  requireRole(role){
    const s = this.session();
    if(!s || s.role !== role){ window.location.href = resolveLoginPath(); return null; }
    return s;
  },

  // ---- customers ----
  getCustomer(id){ return loadDB().customers.find(c => c.id === id); },

  // ---- drivers ----
  getDriver(id){ return loadDB().drivers.find(d => d.id === id); },
  listDrivers(){ return loadDB().drivers; },
  setDriverStatus(id, status){
    const db = loadDB();
    const d = db.drivers.find(x => x.id === id);
    if(d) d.status = status;
    saveDB(db);
  },
  deleteDriver(id){
    const db = loadDB();
    db.drivers = db.drivers.filter(x => x.id !== id);
    saveDB(db);
  },

  // ---- shipments ----
  listShipmentsByCustomer(customerId){ return loadDB().shipments.filter(s => s.customerId === customerId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); },
  listShipmentsByDriver(driverId){ return loadDB().shipments.filter(s => s.driverId === driverId).sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); },
  listAllShipments(){ return loadDB().shipments.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); },
  getShipment(id){ return loadDB().shipments.find(s => s.id === id); },
  createShipment(payload){
    const db = loadDB();
    const approvedDrivers = db.drivers.filter(d => d.status === 'approved');
    const assigned = approvedDrivers.length ? approvedDrivers[Math.floor(Math.random()*approvedDrivers.length)] : null;
    const shipment = {
      id: 'SHP-' + Math.floor(10000 + Math.random()*89999),
      customerId: payload.customerId,
      driverId: assigned ? assigned.id : null,
      pickup: payload.pickup, drop: payload.drop,
      weightKg: payload.weightKg, length: payload.length, width: payload.width, height: payload.height,
      goods: payload.goods,
      vehicle: payload.vehicle,
      status: 'pending',
      createdAt: new Date().toISOString(),
      eta: null,
      history: [
        { label:'Shipment booked', time:new Date().toISOString(), done:true },
        { label: assigned ? `Driver assigned — ${assigned.name}` : 'Awaiting driver assignment', time: assigned ? new Date().toISOString() : null, done: !!assigned },
        { label:'Picked up from origin', time:null, done:false },
        { label:'In transit', time:null, done:false },
        { label:'Delivered', time:null, done:false }
      ]
    };
    db.shipments.unshift(shipment);
    saveDB(db);
    return shipment;
  },
  cancelShipment(id){
    const db = loadDB();
    const s = db.shipments.find(x => x.id === id);
    if(s && (s.status === 'pending' || s.status === 'in_transit')){
      s.status = 'cancelled';
      s.history.push({ label:'Cancelled by customer', time:new Date().toISOString(), done:true });
    }
    saveDB(db);
    return s;
  },
  updateShipmentLocation(id, locationNote){
    const db = loadDB();
    const s = db.shipments.find(x => x.id === id);
    if(s){
      if(s.status === 'pending') s.status = 'in_transit';
      s.lastLocation = locationNote;
      s.lastLocationAt = new Date().toISOString();
      const step = s.history.find(h => h.label === 'In transit');
      if(step && !step.done){ step.done = true; step.time = new Date().toISOString(); }
      s.history.push({ label:`Location update: ${locationNote}`, time:new Date().toISOString(), done:true });
    }
    saveDB(db);
    return s;
  },
  markDelivered(id, proofNote){
    const db = loadDB();
    const s = db.shipments.find(x => x.id === id);
    if(s){
      s.status = 'delivered';
      s.proof = proofNote || 'Proof of delivery uploaded';
      s.deliveredAt = new Date().toISOString();
      const step = s.history.find(h => h.label === 'Delivered');
      if(step){ step.done = true; step.time = new Date().toISOString(); }
      s.history.push({ label:'Proof of delivery uploaded', time:new Date().toISOString(), done:true });
    }
    saveDB(db);
    return s;
  },

  resetDemoData(){ localStorage.removeItem(DB_KEY); loadDB(); }
};

function resolveLoginPath(){
  const path = window.location.pathname;
  if(path.includes('/customer/') || path.includes('/driver/') || path.includes('/admin/')) return '../login.html';
  return 'login.html';
}
