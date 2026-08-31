/* =========================================================
   AI LOGISTICS — AI engine (client-side simulation)
   predictVehicle(): weight + volumetric dims -> vehicle class
   summarizeShipment(): status + history -> plain-language brief
   ========================================================= */

const VEHICLE_CLASSES = [
    { key: 'Two Wheeler', maxWeight: 20, maxVolumeCft: 2, icon: 'bi-bicycle', note: 'Best for parcels, documents & small boxed items.' },
    { key: 'Mini Truck', maxWeight: 750, maxVolumeCft: 120, icon: 'bi-truck-front', note: 'Ideal for household goods, cartons & mid-size cargo.' },
    { key: 'Van', maxWeight: 1000, maxVolumeCft: 180, icon: 'bi-truck', note: 'Good for bulky-but-light goods needing enclosed space.' },
    { key: 'Container Truck', maxWeight: 10000, maxVolumeCft: 1000, icon: 'bi-truck-flatbed', note: 'Required for industrial, palletized or oversized freight.' }
];

/**
 * Predicts the vehicle type from weight (kg) and dimensions (cm).
 * Uses volumetric weight (industry standard: L*W*H(cm) / 5000) alongside
 * actual weight, and takes whichever produces the larger requirement —
 * mirroring how a real recommendation model would reason about capacity.
 */
function predictVehicle(weightKg, lengthCm, widthCm, heightCm) {
    const volumetricKg = (lengthCm * widthCm * heightCm) / 5000;
    const chargeableKg = Math.max(Number(weightKg) || 0, volumetricKg);
    const volumeCft = (lengthCm * widthCm * heightCm) / 28316.8; // cm3 -> cubic feet

    let match = VEHICLE_CLASSES.find(v => chargeableKg <= v.maxWeight && volumeCft <= v.maxVolumeCft);
    if (!match) match = VEHICLE_CLASSES[VEHICLE_CLASSES.length - 1];

    // simple confidence heuristic: how comfortably it fits inside the class ceiling
    const headroom = 1 - (chargeableKg / match.maxWeight);
    const confidence = Math.max(62, Math.min(97, Math.round(78 + headroom * 20)));

    return {
        vehicle: match.key,
        icon: match.icon,
        note: match.note,
        chargeableKg: Math.round(chargeableKg),
        volumetricKg: Math.round(volumetricKg),
        volumeCft: Math.round(volumeCft * 10) / 10,
        confidence
    };
}

/**
 * Generates a plain-language shipment status summary from its record.
 * Simulates an LLM-style summarization over structured tracking events.
 */
function summarizeShipment(shipment) {
    const s = shipment;
    const driver = typeof Store !== 'undefined' ? Store.getDriver(s.driverId) : null;
    const doneSteps = s.history.filter(h => h.done);
    const lastEvent = doneSteps[doneSteps.length - 1];
    const originDrop = `from ${s.pickup.split(',')[0]} to ${s.drop.split(',')[0]}`;

    let lines = [];

    if (s.status === 'pending') {
        lines.push(`Shipment ${s.id} has been booked ${originDrop} and is waiting on driver assignment.`);
        lines.push(driver ? `${driver.name} is expected to pick this up shortly.` : `A driver will be auto-assigned as soon as one is available nearby.`);
    } else if (s.status === 'in_transit') {
        lines.push(`Shipment ${s.id} is currently in transit ${originDrop}.`);
        if (driver) lines.push(`${driver.name} (${driver.vehicle}) is handling the delivery.`);
        if (s.lastLocation) lines.push(`Last known checkpoint: ${s.lastLocation}.`);
        lines.push(`No delays reported — on track for the estimated delivery window.`);
    } else if (s.status === 'delivered') {
        lines.push(`Shipment ${s.id} was delivered successfully ${originDrop}.`);
        if (driver) lines.push(`Handled by ${driver.name}.`);
        lines.push(s.proof ? `Proof of delivery is on file.` : `Delivery confirmed by the driver.`);
    } else if (s.status === 'cancelled') {
        lines.push(`Shipment ${s.id} was cancelled before delivery ${originDrop}.`);
        lines.push(`No charges apply beyond any partial handling already completed.`);
    }

    return lines.join(' ');
}

function statusMeta(status) {
    switch (status) {
        case 'pending': return { label: 'Pending', badge: 'badge-pending', icon: 'bi-hourglass-split' };
        case 'in_transit': return { label: 'In Transit', badge: 'badge-transit', icon: 'bi-signpost-split' };
        case 'delivered': return { label: 'Delivered', badge: 'badge-delivered', icon: 'bi-check-circle' };
        case 'cancelled': return { label: 'Cancelled', badge: 'badge-cancelled', icon: 'bi-x-circle' };
        default: return { label: status, badge: 'badge-pending', icon: 'bi-question-circle' };
    }
}
