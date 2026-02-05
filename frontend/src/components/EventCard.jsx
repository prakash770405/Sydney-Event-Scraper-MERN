import api from "../api";

export default function EventCard({ event }) {
  const handleTicket = async () => {
    const email = prompt("Enter your email");
    if (!email) return;

    await api.post("/events/lead", {
      email,
      consent: true,
      eventId: event._id
    });

    window.location.href = event.originalUrl || "https://eventbrite.com";
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <h3>{event.title}</h3>
      <p>{event.venue}</p>
      <button onClick={handleTicket}>GET TICKETS</button>
    </div>
  );
}
