import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Home,
  Heart,
  User,
  Leaf,
  Coffee,
  Moon,
  Utensils,
  Soup,
  ArrowLeft,
  CheckCircle,
  SlidersHorizontal,
  LogOut,
  Info
} from "lucide-react";
import "./styles.css";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (globalThis.location?.hostname === "localhost" ? "http://localhost:3001" : "/api");

const LOCATIONS = [
  { slug: "rathbone", name: "Rathbone Dining Hall", icon: Utensils },
  { slug: "grind", name: "The Grind Café", icon: Coffee },
  { slug: "common-grounds", name: "Common Grounds", icon: Coffee },
  { slug: "hideaway", name: "Hideaway Café", icon: Soup },
  { slug: "nest-at-night", name: "Nest at Night", icon: Moon },
  { slug: "dorm", name: "Dorm Meals", icon: Leaf }
];

const SURVEY_OPTIONS = [
  ["wantsHighProtein", "High in protein"],
  ["prefersLowImpact", "Low environmental impact"],
  ["prefersPlantBased", "Plant-based meals"],
  ["vegetarian", "Vegetarian"],
  ["vegan", "Vegan"],
  ["avoidsBeef", "Avoid beef"],
  ["avoidsPork", "Avoid pork"]
];

function buildPreferenceParams(preferences) {
  return Object.fromEntries(
    Object.entries(preferences).map(([key, value]) => [key, String(Boolean(value))])
  );
}

function scoreColor(score) {
  if (score >= 80) return "score-green";
  if (score >= 60) return "score-yellow";
  return "score-red";
}

function getMealEmoji(meal) {
  const text = `${meal.name} ${meal.mainProteinCategory || ""}`.toLowerCase();

  if (text.includes("smoothie")) return "🥤";
  if (text.includes("chicken") || text.includes("turkey")) return "🍗";
  if (text.includes("beef") || text.includes("burger")) return "🍔";
  if (text.includes("fish") || text.includes("salmon") || text.includes("tuna")) return "🐟";
  if (text.includes("tofu")) return "🥗";
  if (text.includes("soup")) return "🍲";
  if (text.includes("pasta") || text.includes("noodle")) return "🍝";
  if (text.includes("rice") || text.includes("bowl")) return "🍚";
  if (text.includes("toast") || text.includes("sandwich")) return "🥪";
  if (text.includes("vegetable") || text.includes("salad")) return "🥗";

  return "🍽️";
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [authMode, setAuthMode] = useState("login");

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ecobiteUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [preferences, setPreferences] = useState({
    wantsHighProtein: true,
    prefersLowImpact: true,
    prefersPlantBased: false,
    vegetarian: false,
    vegan: false,
    avoidsBeef: false,
    avoidsPork: false
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allMeals, setAllMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [savedMeals, setSavedMeals] = useState([]);
  const [savedMealNames, setSavedMealNames] = useState(new Set());
  const [activeTab, setActiveTab] = useState("recommended");
  const [profileTab, setProfileTab] = useState("main");
  const [loading, setLoading] = useState(false);

  function sortMealsAlphabetically(meals) {
    return [...meals].sort((a, b) => a.name.localeCompare(b.name));
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  useEffect(() => {
    if (user) {
      loadSavedMeals(user.id);
      loadUserPreferences(user.id);
    }
  }, [user]);

  async function loadSavedMeals(userId) {
    try {
      const res = await fetch(`${API_BASE}/meals/saved/${userId}`);
      const data = await res.json();

      setSavedMeals(
        data.map(item => ({
          name: item.meal_name,
          source: item.location_slug
        }))
      );

      setSavedMealNames(new Set(data.map(item => item.meal_name)));
    } catch (error) {
      console.error("Could not load saved meals:", error);
    }
  }

  function updatePreferences(nextPreferences) {
    setPreferences(nextPreferences);
  }

  async function loadUserPreferences(userId) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`);
      const data = await res.json();

      if (data.preferences) {
        setPreferences({
          wantsHighProtein: data.preferences.wants_high_protein === true || data.preferences.wants_high_protein === 1,
          prefersLowImpact: data.preferences.prefers_low_impact === true || data.preferences.prefers_low_impact === 1,
          prefersPlantBased: data.preferences.prefers_plant_based === true || data.preferences.prefers_plant_based === 1,
          vegetarian: data.preferences.vegetarian === true || data.preferences.vegetarian === 1,
          vegan: data.preferences.vegan === true || data.preferences.vegan === 1,
          avoidsBeef: data.preferences.avoids_beef === true || data.preferences.avoids_beef === 1,
          avoidsPork: data.preferences.avoids_pork === true || data.preferences.avoids_pork === 1
        });
      }
    } catch (error) {
      console.error("Could not load preferences:", error);
    }
  }

  async function finishAuth(data) {
    if (!data.user) {
      alert(data.error || "Sign in failed.");
      return;
    }

    localStorage.setItem("ecobiteUser", JSON.stringify(data.user));
    setUser(data.user);
    setProfileTab("main");

    if (data.isNewUser) {
      setScreen("survey");
      return;
    }

    setScreen("home");
  }

  async function handleEmailAuth() {
    const endpoint = authMode === "login" ? "login" : "signup";

    const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(authForm)
    });

    const data = await res.json();
    await finishAuth(data);
  }

  async function handleGoogleSuccess(credentialResponse) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        credential: credentialResponse.credential
      })
    });

    const data = await res.json();
    await finishAuth(data);
  }

  async function fetchRecommendationsData(locationSlug, prefs) {
    const params = new URLSearchParams({
      location: locationSlug,
      userId: String(user.id),
      limit: "500",
      ...buildPreferenceParams(prefs)
    });
    const res = await fetch(`${API_BASE}/recommendations?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Recommendation request failed: ${res.status}`);
    }

    const data = await res.json();
    let nextAllMeals = sortMealsAlphabetically(data.recommendations || []);

    if (locationSlug === "rathbone") {
      const allParams = new URLSearchParams({
        location: locationSlug,
        userId: String(user.id),
        view: "all",
        limit: "500",
        ...buildPreferenceParams(prefs)
      });
      const allRes = await fetch(`${API_BASE}/recommendations?${allParams.toString()}`);

      if (!allRes.ok) {
        throw new Error(`All meals request failed: ${allRes.status}`);
      }

      const allData = await allRes.json();
      nextAllMeals = allData.recommendations || [];
    }

    return {
      recommendations: data.recommendations || [],
      allMeals: nextAllMeals
    };
  }

  async function hydrateRecommendations(locationSlug, prefs) {
    const data = await fetchRecommendationsData(locationSlug, prefs);
    setRecommendations(data.recommendations);
    setAllMeals(data.allMeals);
  }

  async function savePreferences() {
    if (!user) {
      setScreen("auth");
      return;
    }

    await fetch(`${API_BASE}/users/${user.id}/preferences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferences)
    });

    if (selectedLocation) {
      try {
        await hydrateRecommendations(selectedLocation, preferences);
      } catch (error) {
        console.error("Could not refresh recommendations after saving preferences:", error);
      }
    }

    setScreen("home");
  }

  async function loadRecommendations(locationSlug, overridePreferences = null) {
    if (!user) {
      setScreen("auth");
      return;
    }

    setLoading(true);
    setSelectedLocation(locationSlug);
    setActiveTab("recommended");
    setAllMeals([]);

    const prefs = overridePreferences || preferences;

    try {
      await hydrateRecommendations(locationSlug, prefs);
      setScreen("recommendations");
    } catch (error) {
      alert("Could not load recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function saveMeal(meal) {
    if (!user) {
      setScreen("auth");
      return;
    }

    if (savedMealNames.has(meal.name)) {
      return;
    }

    await fetch(`${API_BASE}/meals/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        mealName: meal.name,
        locationSlug: selectedLocation || meal.source || "unknown"
      })
    });

    setSavedMeals(prev => [...prev, meal]);

    setSavedMealNames(prev => {
      const next = new Set(prev);
      next.add(meal.name);
      return next;
    });
  }

  function logout() {
    localStorage.removeItem("ecobiteUser");
    setUser(null);
    setSavedMeals([]);
    setSavedMealNames(new Set());
    setScreen("landing");
  }

  const visibleRecommendations =
    activeTab === "all"
      ? allMeals
      : recommendations;

  if (screen === "landing") {
    return (
      <main className="app-shell landing-bg">
        <section className="landing-content">
          <div className="logo-row">
            <div className="logo-circle">
              <Leaf size={28} />
            </div>
            <h1>EcoBite</h1>
          </div>

          <h2>Eat well. Do good.</h2>

          <p>
            Personalized meal recommendations that are healthy, sustainable,
            and easy to choose.
          </p>

          <button className="primary-btn" onClick={() => setScreen("auth")}>
            Get Started
          </button>

          <button className="secondary-btn" onClick={() => setScreen("auth")}>
            Sign In
          </button>
        </section>
      </main>
    );
  }

  if (screen === "auth") {
    return (
      <main className="app-shell">
        <header className="simple-header">
          <button className="plain-btn" onClick={() => setScreen("landing")}>
            <ArrowLeft />
          </button>
          <h3>{authMode === "login" ? "Sign In" : "Create Account"}</h3>
          <div className="header-spacer" />
        </header>

        <section className="auth-layout">
          <aside className="auth-intro">
            <p className="eyebrow">Lehigh dining, made clearer</p>
            <h2>Choose meals that fit your goals without guessing.</h2>
            <p>
              Compare sustainability and nutrition scores, save favorites, and get
              recommendations shaped around the changes you actually want to make.
            </p>
            <div className="auth-feature-list">
              <span>Daily dining hall picks</span>
              <span>Evidence-based impact scores</span>
              <span>Dorm meal ideas that are realistic</span>
            </div>
          </aside>

          <section className="auth-card">
            {authMode === "signup" && (
              <input
                placeholder="Name"
                value={authForm.name}
                onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
              />
            )}

            <input
              placeholder="Email"
              value={authForm.email}
              onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
            />

            <input
              placeholder="Password"
              type="password"
              value={authForm.password}
              onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            />

            <button className="primary-btn" onClick={handleEmailAuth}>
              {authMode === "login" ? "Sign In" : "Create Account"}
            </button>

            <div className="divider">or</div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Google sign-in failed.")}
            />

            <button
              className="text-btn"
              onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            >
              {authMode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </button>
          </section>
        </section>
      </main>
    );
  }

  if (screen === "survey") {
    return (
      <main className="app-shell">
        <header className="simple-header">
          <button className="plain-btn" onClick={() => setScreen("home")}>
            <ArrowLeft />
          </button>
          <h3>Tell us about you</h3>
          <div className="header-spacer" />
        </header>

        <h2>What are your goals?</h2>
        <p className="small-muted">Choose all that apply.</p>

        <section className="survey-list">
          {SURVEY_OPTIONS.map(([key, label]) => (
            <button
              className={`survey-option ${preferences[key] ? "selected" : ""}`}
              key={key}
              onClick={() => {
                const nextPreferences = {
                  ...preferences,
                  [key]: !preferences[key]
                };

                updatePreferences(nextPreferences);
              }}
            >
              <span>{label}</span>
              {preferences[key] && <CheckCircle size={20} className="orange-icon" />}
            </button>
          ))}
        </section>

       <button className="primary-btn bottom-btn" onClick={savePreferences}>
        Done
      </button>
      </main>
    );
  }

  if (screen === "home") {
    return (
      <main className="app-shell">
        <header className="top-header">
          <div>
            <p className="small-muted">{getGreeting()}</p>
            <h2>Where would you like to eat?</h2>
          </div>
          <button className="icon-btn" onClick={() => setScreen("survey")}>
            <SlidersHorizontal size={22} />
          </button>
        </header>

        <section className="location-grid">
          {LOCATIONS.map(location => {
            const Icon = location.icon;
            return (
              <button
                key={location.slug}
                className="location-card"
                onClick={() => loadRecommendations(location.slug)}
              >
                <div className="location-icon">
                  <Icon size={24} />
                </div>
                <span>{location.name}</span>
              </button>
            );
          })}
        </section>

        {loading && <p className="loading-text">Loading recommendations...</p>}

        <BottomNav screen={screen} setScreen={setScreen} />
      </main>
    );
  }

  if (screen === "recommendations") {
    const locationName =
      LOCATIONS.find(l => l.slug === selectedLocation)?.name || "Recommendations";

    return (
      <main className="app-shell">
        <header className="simple-header">
          <button className="plain-btn" onClick={() => setScreen("home")}>
            <ArrowLeft />
          </button>
          <h3>{locationName}</h3>
          <div className="header-spacer" />
        </header>

        <div className="tabs">
          <button
            className={`tab ${activeTab === "recommended" ? "active" : ""}`}
            onClick={() => setActiveTab("recommended")}
          >
            Recommended
          </button>

          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Meals
          </button>
        </div>

        <section className="meal-list">
          {visibleRecommendations.length === 0 && (
            <p className="small-muted">No meals found for this filter.</p>
          )}

          {visibleRecommendations.map((meal, index) => (
            <article
              className="meal-card"
              key={`${meal.name}-${index}`}
              onClick={() => {
                setSelectedMeal(meal);
                setScreen("detail");
              }}
            >
              <div className="meal-thumb">{getMealEmoji(meal)}</div>

              <div className="meal-info">
                <h4>{meal.name}</h4>
                <p>{meal.calories} Cal</p>
                <div className="mini-scores">
                  <span>Sustainability {meal.sustainabilityScore}</span>
                  <span>Nutrition {meal.nutritionScore}</span>
                </div>
              </div>

              <div className={`score-badge ${scoreColor(meal.recommendationScore)}`}>
                {Math.round(meal.recommendationScore)}
              </div>
            </article>
          ))}
        </section>

        <BottomNav screen={screen} setScreen={setScreen} />
      </main>
    );
  }

  if (screen === "detail" && selectedMeal) {
    const isSaved = savedMealNames.has(selectedMeal.name);

    return (
      <main className="app-shell detail-screen">
        <header className="simple-header">
          <button className="plain-btn" onClick={() => setScreen("recommendations")}>
            <ArrowLeft />
          </button>
          <button className="plain-btn" onClick={() => saveMeal(selectedMeal)}>
            <Heart fill={isSaved ? "#ff9700" : "none"} />
          </button>
        </header>

        <div className="hero-meal">{getMealEmoji(selectedMeal)}</div>

        <h2>{selectedMeal.name}</h2>
        <p className="calorie-line">🔥 {selectedMeal.calories} Calories</p>

        <div className="score-row">
          <ScorePill label="Overall" value={selectedMeal.recommendationScore} />
          <ScorePill label="Eco" value={selectedMeal.sustainabilityScore} />
          <ScorePill label="Nutrition" value={selectedMeal.nutritionScore} />
        </div>

        <section className="detail-card">
          <h3>Why it’s recommended</h3>
          <ul>
            {selectedMeal.whyRecommended?.map(reason => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="detail-card nutrition-grid">
          <div>
            <strong>{selectedMeal.protein}g</strong>
            <span>Protein</span>
          </div>
          <div>
            <strong>{selectedMeal.sodium}mg</strong>
            <span>Sodium</span>
          </div>
          <div>
            <strong>{selectedMeal.fiber}g</strong>
            <span>Fiber</span>
          </div>
          <div>
            <strong>{selectedMeal.satFat}g</strong>
            <span>Sat Fat</span>
          </div>
        </section>

        <button
          className={`primary-btn bottom-btn ${isSaved ? "saved-btn" : ""}`}
          onClick={() => saveMeal(selectedMeal)}
          disabled={isSaved}
        >
          {isSaved ? "Saved" : "Add to Saved"}
        </button>
      </main>
    );
  }

  if (screen === "saved") {
    return (
      <main className="app-shell">
        <header className="simple-header">
          <h3>Saved Meals</h3>
        </header>

        <section className="meal-list">
          {savedMeals.length === 0 && (
            <p className="small-muted">No meals saved yet.</p>
          )}

          {savedMeals.map((meal, index) => (
            <article className="meal-card" key={`${meal.name}-${index}`}>
              <div className="meal-thumb">{getMealEmoji(meal)}</div>
              <div className="meal-info">
                <h4>{meal.name}</h4>
                <p>{meal.source || "Saved meal"}</p>
              </div>
              <Heart className="orange-icon" fill="#ff9700" />
            </article>
          ))}
        </section>

        <BottomNav screen={screen} setScreen={setScreen} />
      </main>
    );
  }

  if (screen === "profile") {
    return (
      <main className="app-shell">
        <header className="simple-header">
          <h3>Profile</h3>
        </header>

        <div className="profile-icon-large">
          <User size={42} />
        </div>

        <h2 className="center-text">{user?.name || "EcoBite User"}</h2>
        <p className="small-muted center-text">{user?.email || "Lehigh University"}</p>

        {profileTab === "main" && (
          <section className="settings-list">
            <button onClick={() => setProfileTab("preferences")}>
              My Preferences
            </button>
            <button onClick={() => setProfileTab("about")}>
              About EcoBite
            </button>
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} />
              Log Out
            </button>
          </section>
        )}

        {profileTab === "preferences" && (
          <section className="detail-card">
            <button className="text-btn" onClick={() => setProfileTab("main")}>
              Back
            </button>
            <h3>My Preferences</h3>
            <p>High Protein: {preferences.wantsHighProtein ? "Yes" : "No"}</p>
            <p>Low Impact: {preferences.prefersLowImpact ? "Yes" : "No"}</p>
            <p>Plant-Based: {preferences.prefersPlantBased ? "Yes" : "No"}</p>
            <p>Vegetarian: {preferences.vegetarian ? "Yes" : "No"}</p>
            <p>Vegan: {preferences.vegan ? "Yes" : "No"}</p>
            <p>Avoid Beef: {preferences.avoidsBeef ? "Yes" : "No"}</p>
            <p>Avoid Pork: {preferences.avoidsPork ? "Yes" : "No"}</p>
          </section>
        )}

        {profileTab === "about" && (
          <section className="detail-card">
            <button className="text-btn" onClick={() => setProfileTab("main")}>
              Back
            </button>
            <h3>About EcoBite</h3>
            <p>
              EcoBite helps Lehigh students choose meals that are better for
              their health and lower in environmental impact.
            </p>
            <p>
              Sustainability scores are based on food-category environmental
              data, while nutrition scores use available menu nutrition facts.
            </p>
          </section>
        )}

        <BottomNav screen={screen} setScreen={setScreen} />
      </main>
    );
  }

  return null;
}

function ScorePill({ label, value }) {
  return (
    <div className="score-pill">
      <strong>{Math.round(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function BottomNav({ screen, setScreen }) {
  return (
    <nav className="bottom-nav">
      <button
        className={screen === "home" ? "nav-active" : ""}
        onClick={() => setScreen("home")}
      >
        <Home size={20} />
        Home
      </button>

      <button
        className={screen === "saved" ? "nav-active" : ""}
        onClick={() => setScreen("saved")}
      >
        <Heart size={20} />
        Saved
      </button>

      <button
        className={screen === "profile" ? "nav-active" : ""}
        onClick={() => setScreen("profile")}
      >
        <User size={20} />
        Profile
      </button>
    </nav>
  );
}
