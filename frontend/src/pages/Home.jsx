import { useNavigate } from 'react-router-dom';
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import home from "../images/img1.jpg";
import liam from "../images/liam.jpeg";
import emily from "../images/emily.jpeg";
import aisha from "../images/Aisha.jpeg";
import world from "../images/world.jpg";
import rio from "../images/Rio.jpeg";
import tokyo from "../images/Tokyo.jpg";

const Home = () => {
  const navigate = useNavigate();

  // Check if user is logged in by looking for token in localStorage
  const isLoggedIn = localStorage.getItem('token') !== null;

  const handleDiscoverClick = () => {
    if (isLoggedIn) {
      navigate("/country");
    } else {
      // Redirect to login page if not logged in
      navigate("/login");
      // Alternatively, you could show a modal or toast notification:
      // alert("Please log in to access this feature!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section with Image Background */}
      <div
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage: `url(${home})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          height: "90vh",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            EXPLORE YOUR DREAM DESTINATIONS
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-8">
            ADD THEM TO YOUR WISHLIST
          </h2>
          <p className="text-xl max-w-2xl mb-8">
            From tropical beaches to snowy mountains, create your personalized
            travel wishlist and start your global adventure.
          </p>
          <button
            className={`mt-4 px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-300 ${
              isLoggedIn
                ? "bg-white text-indigo-900 hover:bg-gray-100"
                : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
            onClick={handleDiscoverClick}
            disabled={!isLoggedIn}
          >
            {isLoggedIn ? "Discover the World" : "Log in to Discover"}
          </button>
        </div>
      </div>

      {/* What the World Has to Say Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          WHAT THE WORLD HAS TO SAY
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Emily",
              country: "Canada",
              message:
                "This site helped me plan my dream trip to Bali! The wishlist made it easy to keep track of all the places I wanted to go.",
              image: emily,
            },
            {
              name: "Liam",
              country: "Australia",
              message:
                "I discovered so many hidden gems across Europe. Now my wishlist is full, and I couldn't be more excited!",
              image: liam,
            },
            {
              name: "Aisha",
              country: "UAE",
              message:
                "It's like having a personalized travel guide! I love how easy it is to find and save new destinations.",
              image: aisha,
            },
          ].map((traveler, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  src={traveler.image}
                  alt={traveler.name}
                  className="h-12 w-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold text-lg">{traveler.name}</h4>
                  <p className="text-gray-500 text-sm">
                    From {traveler.country}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-lg">"{traveler.message}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="bg-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            UPCOMING EVENTS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "World Travel Expo 2025",
                date: "June 15, 2025",
                description:
                  "Join thousands of travelers and tourism experts at the global expo in Berlin. Discover new destinations and experiences!",
                image: world,
              },
              {
                title: "Tokyo Cherry Blossom Festival",
                date: "March 25, 2025",
                description:
                  "Experience the breathtaking beauty of cherry blossoms in full bloom across Japan's capital city.",
                image: tokyo,
              },
              {
                title: "Rio Carnival Experience",
                date: "February 10, 2025",
                description:
                  "Add the vibrant Rio Carnival to your wishlist and dance your way through the most colorful celebration in the world!",
                image: rio,
              },
            ].map((event, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-500 mb-4">Date: {event.date}</p>
                  <p className="text-gray-700 mb-4">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;