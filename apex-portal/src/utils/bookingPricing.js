export const AMENITY_OPTIONS = [
  { title: "WiFi", value: "wifi" },
  { title: "Air Conditioning", value: "ac" },
  { title: "TV", value: "tv" },
  { title: "Mini Bar", value: "minibar" }
];

export function isPenthouse(room) {
  return room?.name?.toLowerCase().includes("penthouse") || room?.type === "penthouse";
}

export function isSeaside(room) {
  const name = room?.name?.toLowerCase() || "";
  const view = room?.view?.toLowerCase?.() || "";
  const roomNumber = Number(name.match(/-(\d+)$/)?.[1]);

  return (
    name.includes("sea") ||
    view.includes("sea") ||
    room?.availableAmenities?.includes("balcony") ||
    roomNumber > 20
  );
}

export function getAmenityPrice(amenity, room) {
  const prices = {
    wifi: 5,
    ac: isPenthouse(room) ? 5 : 2.5,
    tv: 4,
    minibar: isPenthouse(room) ? 0 : isSeaside(room) ? 10 : 7.5
  };

  return prices[amenity] ?? 0;
}

export function calculateAmenityTotal(amenities = [], room) {
  return amenities.reduce((sum, amenity) => sum + getAmenityPrice(amenity, room), 0);
}

export function calculateBookingTotal(room, nights, amenities = []) {
  const roomPrice = Number(room?.price || 0);
  const nightCount = Number(nights || 0);
  return (roomPrice + calculateAmenityTotal(amenities, room)) * nightCount;
}

export function formatMoney(amount) {
  return Number(amount || 0).toFixed(2);
}
