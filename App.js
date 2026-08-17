import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MEALS = [
  {
    name: "Chicken Rice Bowl",
    ingredients: ["chicken", "rice", "pepper", "onion"],
    ingredientAmounts: ["1 chicken breast", "1 cup rice", "1 bell pepper", "1/2 onion"],
    budget: ["Low", "Medium", "High"],
    time: 30,
    description: "A simple bowl with seasoned chicken, rice, and vegetables.",
    steps: [
      "Cook the rice according to the package directions.",
      "Cut the chicken, pepper, and onion into small pieces.",
      "Cook the chicken in a pan until it is no longer pink.",
      "Add the pepper and onion and cook until softened.",
      "Serve the chicken and vegetables over the rice.",
    ],
  },
  {
    name: "Vegetable Pasta",
    ingredients: ["pasta", "tomato", "pepper", "onion", "spinach"],
    ingredientAmounts: [
      "8 oz pasta",
      "1 tomato",
      "1 bell pepper",
      "1/2 onion",
      "1 cup spinach",
    ],
    budget: ["Low", "Medium", "High"],
    time: 25,
    description: "Quick pasta made with vegetables and a light tomato sauce.",
    steps: [
      "Boil the pasta according to the package directions.",
      "Cut the tomato, pepper, and onion into small pieces.",
      "Cook the vegetables in a pan until softened.",
      "Add the spinach and cook until wilted.",
      "Drain the pasta, mix everything together, and serve.",
    ],
  },
  {
    name: "Bean and Cheese Quesadillas",
    ingredients: ["tortilla", "beans", "cheese"],
    ingredientAmounts: ["2 tortillas", "1/2 cup beans", "1/2 cup shredded cheese"],
    budget: ["Low", "Medium"],
    time: 15,
    description: "Crispy quesadillas filled with beans and melted cheese.",
    steps: [
      "Spread the beans over one tortilla.",
      "Add the shredded cheese.",
      "Place the second tortilla on top.",
      "Cook in a pan for 2 to 3 minutes on each side.",
      "Cut into slices and serve.",
    ],
  },
  {
    name: "Egg Fried Rice",
    ingredients: ["egg", "rice", "peas", "carrot", "onion"],
    ingredientAmounts: [
      "2 eggs",
      "2 cups cooked rice",
      "1/2 cup peas",
      "1 carrot",
      "1/2 onion",
    ],
    budget: ["Low", "Medium"],
    time: 20,
    description: "A fast meal that works well with leftover rice.",
    steps: [
      "Dice the carrot and onion.",
      "Cook the vegetables in a pan until softened.",
      "Move the vegetables to one side and scramble the eggs.",
      "Add the cooked rice and peas.",
      "Mix everything together and cook until hot.",
    ],
  },
  {
    name: "Turkey Tacos",
    ingredients: ["turkey", "tortilla", "lettuce", "tomato", "cheese"],
    ingredientAmounts: [
      "1 lb ground turkey",
      "6 tortillas",
      "1 cup lettuce",
      "1 tomato",
      "1/2 cup shredded cheese",
    ],
    budget: ["Medium", "High"],
    time: 30,
    description: "Easy tacos with seasoned turkey and simple toppings.",
    steps: [
      "Cook the ground turkey in a pan until browned.",
      "Season the turkey with taco seasoning.",
      "Warm the tortillas.",
      "Chop the lettuce and tomato.",
      "Fill each tortilla with turkey, lettuce, tomato, and cheese.",
    ],
  },
  {
    name: "Baked Salmon and Vegetables",
    ingredients: ["salmon", "broccoli", "potato", "lemon"],
    ingredientAmounts: ["2 salmon fillets", "2 cups broccoli", "2 potatoes", "1 lemon"],
    budget: ["High"],
    time: 45,
    description: "A simple baked salmon dinner with vegetables.",
    steps: [
      "Preheat the oven to 400°F.",
      "Cut the potatoes into small pieces.",
      "Place the salmon, broccoli, and potatoes on a baking sheet.",
      "Season everything and squeeze lemon over the salmon.",
      "Bake for 25 to 30 minutes, or until the salmon is cooked through.",
    ],
  },
];

const BUDGETS = ["Low", "Medium", "High"];
const TIMES = [15, 30, 45];

const STORAGE_KEYS = {
  account: "mealmatch_account",
  pantry: "mealmatch_pantry",
  favorites: "mealmatch_favorites",
};

function ChoiceButton({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.choiceButton, selected && styles.choiceButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function LoginScreen({ onLogin, onCreateAccount }) {
  const [email, setEmail] = useState("demo@mealmatch.com");
  const [password, setPassword] = useState("demo123");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authContainer}>
        <Text style={styles.appName}>MealMatch</Text>
        <Text style={styles.subtitle}>Sign in to start planning meals.</Text>

        <View style={styles.card}>
          <Text style={styles.stepTitle}>Login</Text>

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.singleInput}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.singleInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onLogin(email, password)}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={onCreateAccount}>
          <Text style={styles.secondaryButtonText}>Create an Account</Text>
        </TouchableOpacity>

        <Text style={styles.demoText}>
          Demo login: demo@mealmatch.com / demo123
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function CreateAccountScreen({ onBack, onAccountCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function createAccount() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    const account = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.account, JSON.stringify(account));
    Alert.alert("Account created", "Your local MealMatch account was created.");
    onAccountCreated(account);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.authContainer}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Back to login</Text>
        </TouchableOpacity>

        <Text style={styles.appName}>Create Account</Text>
        <Text style={styles.subtitle}>
          This prototype stores the account only on this device.
        </Text>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.singleInput}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />

          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.singleInput}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Email"
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.singleInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Password"
          />

          <TouchableOpacity style={styles.primaryButton} onPress={createAccount}>
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BottomNav({ screen, setScreen }) {
  const navItems = [
    ["home", "Home"],
    ["pantry", "Pantry"],
    ["favorites", "Favorites"],
    ["profile", "Profile"],
  ];

  return (
    <View style={styles.bottomNav}>
      {navItems.map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={styles.navButton}
          onPress={() => setScreen(key)}
        >
          <Text style={[styles.navText, screen === key && styles.navTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function HomeScreen({
  ingredientText,
  setIngredientText,
  budget,
  setBudget,
  availableTime,
  setAvailableTime,
  suggestions,
  showResults,
  setShowResults,
  pantry,
  openRecipe,
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Find a Meal</Text>
      <Text style={styles.subtitle}>
        Enter ingredients or use items already saved in your pantry.
      </Text>

      {pantry.length > 0 && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>Pantry items included</Text>
          <Text style={styles.noticeText}>{pantry.join(", ")}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.stepTitle}>1. Ingredients on hand</Text>
        <Text style={styles.helpText}>Separate each ingredient with a comma.</Text>
        <TextInput
          style={styles.multiInput}
          placeholder="Example: chicken, rice, onion"
          value={ingredientText}
          onChangeText={(text) => {
            setIngredientText(text);
            setShowResults(false);
          }}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>2. Budget level</Text>
        <View style={styles.choiceRow}>
          {BUDGETS.map((item) => (
            <ChoiceButton
              key={item}
              label={item}
              selected={budget === item}
              onPress={() => {
                setBudget(item);
                setShowResults(false);
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>3. Cooking time</Text>
        <View style={styles.choiceRow}>
          {TIMES.map((minutes) => (
            <ChoiceButton
              key={minutes}
              label={`${minutes} min`}
              selected={availableTime === minutes}
              onPress={() => {
                setAvailableTime(minutes);
                setShowResults(false);
              }}
            />
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setShowResults(true)}
      >
        <Text style={styles.primaryButtonText}>Find Meals</Text>
      </TouchableOpacity>

      {showResults && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Meal Suggestions</Text>

          {suggestions.map((meal) => (
            <TouchableOpacity
              key={meal.name}
              style={styles.mealCard}
              onPress={() => openRecipe(meal)}
            >
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.timeBadge}>{meal.time} min</Text>
              </View>

              <Text style={styles.mealDescription}>{meal.description}</Text>
              <Text style={styles.smallLabel}>Matched ingredients</Text>
              <Text style={styles.matchText}>
                {meal.matches.length > 0
                  ? meal.matches.join(", ")
                  : "Fits your budget and time but may require groceries."}
              </Text>
              <Text style={styles.viewRecipeText}>View Recipe →</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function RecipeScreen({ meal, favorites, toggleFavorite, onBack }) {
  const isFavorite = favorites.includes(meal.name);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.recipeTitle}>{meal.name}</Text>
      <Text style={styles.recipeDescription}>{meal.description}</Text>
      <Text style={styles.recipeMeta}>
        {meal.time} minutes • {meal.budget.join(" / ")} budget
      </Text>

      <TouchableOpacity
        style={[styles.favoriteButton, isFavorite && styles.favoriteButtonSaved]}
        onPress={() => toggleFavorite(meal.name)}
      >
        <Text
          style={[
            styles.favoriteButtonText,
            isFavorite && styles.favoriteButtonTextSaved,
          ]}
        >
          {isFavorite ? "★ Saved to Favorites" : "☆ Save Favorite"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {meal.ingredientAmounts.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {meal.steps.map((step, index) => (
          <Text key={step} style={styles.listItem}>
            {index + 1}. {step}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

function PantryScreen({ pantry, addPantryItem, removePantryItem }) {
  const [newItem, setNewItem] = useState("");

  function addItem() {
    const item = newItem.trim().toLowerCase();
    if (!item) return;
    addPantryItem(item);
    setNewItem("");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Pantry</Text>
      <Text style={styles.subtitle}>
        Save ingredients you already have. These items are automatically used
        when MealMatch searches for meals.
      </Text>

      <View style={styles.card}>
        <Text style={styles.stepTitle}>Add ingredient</Text>
        <TextInput
          style={styles.singleInput}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Example: rice"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={addItem}>
          <Text style={styles.primaryButtonText}>Add to Pantry</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.resultsTitle}>Saved Ingredients</Text>

      {pantry.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>Your pantry is empty.</Text>
        </View>
      ) : (
        pantry.map((item) => (
          <View key={item} style={styles.listCard}>
            <Text style={styles.listCardText}>{item}</Text>
            <TouchableOpacity onPress={() => removePantryItem(item)}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function FavoritesScreen({ favorites, openRecipe, removeFavorite }) {
  const favoriteMeals = MEALS.filter((meal) => favorites.includes(meal.name));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Favorite Meals</Text>
      <Text style={styles.subtitle}>
        Meals you save from a recipe page will appear here.
      </Text>

      {favoriteMeals.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>You have not saved any meals yet.</Text>
        </View>
      ) : (
        favoriteMeals.map((meal) => (
          <View key={meal.name} style={styles.mealCard}>
            <TouchableOpacity onPress={() => openRecipe(meal)}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.timeBadge}>{meal.time} min</Text>
              </View>
              <Text style={styles.mealDescription}>{meal.description}</Text>
              <Text style={styles.viewRecipeText}>View Recipe →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeFavorite(meal.name)}>
              <Text style={styles.removeFavoriteText}>Remove Favorite</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function ProfileScreen({ user, onLogout }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.smallLabel}>SIGNED IN AS</Text>
        <Text style={styles.profileName}>{user?.name || "Demo User"}</Text>
        <Text style={styles.profileEmail}>
          {user?.email || "demo@mealmatch.com"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sprint 3 Prototype</Text>
        <Text style={styles.listItem}>• Basic login and create account</Text>
        <Text style={styles.listItem}>• Pantry add/remove with local storage</Text>
        <Text style={styles.listItem}>• Saved favorite meals</Text>
        <Text style={styles.listItem}>• Meal search and recipe pages</Text>
      </View>

      <TouchableOpacity style={styles.secondaryButton} onPress={onLogout}>
        <Text style={styles.secondaryButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [authScreen, setAuthScreen] = useState("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [screen, setScreen] = useState("home");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [ingredientText, setIngredientText] = useState("");
  const [budget, setBudget] = useState("Low");
  const [availableTime, setAvailableTime] = useState(30);
  const [showResults, setShowResults] = useState(false);

  const [pantry, setPantry] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadSavedData();
  }, []);

  async function loadSavedData() {
    try {
      const savedPantry = await AsyncStorage.getItem(STORAGE_KEYS.pantry);
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.favorites);

      if (savedPantry) setPantry(JSON.parse(savedPantry));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    } catch (error) {
      console.log("Could not load saved data:", error);
    }
  }

  async function handleLogin(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === "demo@mealmatch.com" && password === "demo123") {
      setUser({ name: "Demo User", email: cleanEmail });
      setLoggedIn(true);
      return;
    }

    try {
      const savedAccount = await AsyncStorage.getItem(STORAGE_KEYS.account);

      if (!savedAccount) {
        Alert.alert(
          "Account not found",
          "Create an account or use the demo login."
        );
        return;
      }

      const account = JSON.parse(savedAccount);

      if (account.email === cleanEmail && account.password === password) {
        setUser(account);
        setLoggedIn(true);
      } else {
        Alert.alert("Login failed", "Email or password is incorrect.");
      }
    } catch (error) {
      Alert.alert("Login error", "Unable to read the saved account.");
    }
  }

  function handleAccountCreated(account) {
    setUser(account);
    setLoggedIn(true);
    setAuthScreen("login");
  }

  function logout() {
    setLoggedIn(false);
    setUser(null);
    setScreen("home");
    setSelectedMeal(null);
    setAuthScreen("login");
  }

  async function savePantry(items) {
    setPantry(items);
    await AsyncStorage.setItem(STORAGE_KEYS.pantry, JSON.stringify(items));
  }

  function addPantryItem(item) {
    if (pantry.includes(item)) {
      Alert.alert("Already saved", `${item} is already in your pantry.`);
      return;
    }
    savePantry([...pantry, item]);
    setShowResults(false);
  }

  function removePantryItem(item) {
    savePantry(pantry.filter((savedItem) => savedItem !== item));
    setShowResults(false);
  }

  async function saveFavorites(items) {
    setFavorites(items);
    await AsyncStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(items));
  }

  function toggleFavorite(mealName) {
    if (favorites.includes(mealName)) {
      saveFavorites(favorites.filter((name) => name !== mealName));
    } else {
      saveFavorites([...favorites, mealName]);
    }
  }

  function removeFavorite(mealName) {
    saveFavorites(favorites.filter((name) => name !== mealName));
  }

  function openRecipe(meal) {
    setPreviousScreen(screen);
    setSelectedMeal(meal);
    setScreen("recipe");
  }

  function closeRecipe() {
    setSelectedMeal(null);
    setScreen(previousScreen);
  }

  const typedIngredients = useMemo(() => {
    return ingredientText
      .toLowerCase()
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [ingredientText]);

  const allIngredients = useMemo(() => {
    return [...new Set([...typedIngredients, ...pantry])];
  }, [typedIngredients, pantry]);

  const suggestions = useMemo(() => {
    return MEALS
      .filter(
        (meal) =>
          meal.budget.includes(budget) &&
          meal.time <= availableTime
      )
      .map((meal) => {
        const matches = meal.ingredients.filter((ingredient) =>
          allIngredients.some(
            (enteredIngredient) =>
              enteredIngredient.includes(ingredient) ||
              ingredient.includes(enteredIngredient)
          )
        );

        return {
          ...meal,
          matches,
          score: matches.length,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [allIngredients, budget, availableTime]);

  if (!loggedIn) {
    if (authScreen === "create") {
      return (
        <CreateAccountScreen
          onBack={() => setAuthScreen("login")}
          onAccountCreated={handleAccountCreated}
        />
      );
    }

    return (
      <LoginScreen
        onLogin={handleLogin}
        onCreateAccount={() => setAuthScreen("create")}
      />
    );
  }

  let content;

  if (screen === "recipe" && selectedMeal) {
    content = (
      <RecipeScreen
        meal={selectedMeal}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onBack={closeRecipe}
      />
    );
  } else if (screen === "pantry") {
    content = (
      <PantryScreen
        pantry={pantry}
        addPantryItem={addPantryItem}
        removePantryItem={removePantryItem}
      />
    );
  } else if (screen === "favorites") {
    content = (
      <FavoritesScreen
        favorites={favorites}
        openRecipe={openRecipe}
        removeFavorite={removeFavorite}
      />
    );
  } else if (screen === "profile") {
    content = <ProfileScreen user={user} onLogout={logout} />;
  } else {
    content = (
      <HomeScreen
        ingredientText={ingredientText}
        setIngredientText={setIngredientText}
        budget={budget}
        setBudget={setBudget}
        availableTime={availableTime}
        setAvailableTime={setAvailableTime}
        suggestions={suggestions}
        showResults={showResults}
        setShowResults={setShowResults}
        pantry={pantry}
        openRecipe={openRecipe}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.appHeader}>
        <Text style={styles.headerLogo}>MealMatch</Text>
        <Text style={styles.headerUser}>{user?.name || "Demo User"}</Text>
      </View>

      <View style={styles.screenArea}>{content}</View>

      {screen !== "recipe" && (
        <BottomNav screen={screen} setScreen={setScreen} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F2",
  },
  screenArea: {
    flex: 1,
  },
  authContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    paddingBottom: 35,
  },
  appHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#E3E7E1",
    backgroundColor: "#FFFFFF",
  },
  headerLogo: {
    fontSize: 21,
    fontWeight: "800",
    color: "#26382A",
  },
  headerUser: {
    fontSize: 13,
    color: "#687268",
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#26382A",
    marginTop: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#26382A",
  },
  subtitle: {
    fontSize: 15,
    color: "#5D675F",
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E3E7E1",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#26382A",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#26382A",
    marginBottom: 10,
  },
  helpText: {
    fontSize: 13,
    color: "#737B74",
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#455047",
    marginBottom: 6,
    marginTop: 6,
  },
  singleInput: {
    borderWidth: 1,
    borderColor: "#CBD3C9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#26382A",
    backgroundColor: "#FCFDFC",
    marginBottom: 12,
  },
  multiInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#CBD3C9",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#26382A",
    textAlignVertical: "top",
    backgroundColor: "#FCFDFC",
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  choiceButton: {
    flexGrow: 1,
    minWidth: 85,
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFC9BD",
    backgroundColor: "#FFFFFF",
  },
  choiceButtonSelected: {
    backgroundColor: "#345E3D",
    borderColor: "#345E3D",
  },
  choiceText: {
    color: "#345E3D",
    fontWeight: "600",
  },
  choiceTextSelected: {
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#345E3D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#345E3D",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#345E3D",
    fontSize: 16,
    fontWeight: "700",
  },
  demoText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 12,
    color: "#737B74",
  },
  noticeBox: {
    backgroundColor: "#EAF0E8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#345E3D",
  },
  noticeText: {
    fontSize: 13,
    color: "#455047",
    marginTop: 4,
    lineHeight: 19,
  },
  resultsSection: {
    marginTop: 26,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#26382A",
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E3E7E1",
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  mealName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#26382A",
  },
  timeBadge: {
    backgroundColor: "#EAF0E8",
    color: "#345E3D",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  mealDescription: {
    fontSize: 14,
    color: "#5D675F",
    lineHeight: 20,
    marginTop: 8,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#737B74",
    marginTop: 14,
  },
  matchText: {
    fontSize: 14,
    color: "#345E3D",
    marginTop: 4,
    lineHeight: 20,
  },
  viewRecipeText: {
    marginTop: 14,
    color: "#345E3D",
    fontWeight: "700",
    fontSize: 15,
  },
  backText: {
    color: "#345E3D",
    fontWeight: "700",
    marginBottom: 18,
  },
  recipeTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#26382A",
  },
  recipeDescription: {
    fontSize: 16,
    color: "#5D675F",
    lineHeight: 23,
    marginTop: 8,
  },
  recipeMeta: {
    fontSize: 14,
    color: "#345E3D",
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 18,
  },
  favoriteButton: {
    borderWidth: 1,
    borderColor: "#345E3D",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  favoriteButtonSaved: {
    backgroundColor: "#345E3D",
  },
  favoriteButtonText: {
    color: "#345E3D",
    fontWeight: "700",
  },
  favoriteButtonTextSaved: {
    color: "#FFFFFF",
  },
  listItem: {
    fontSize: 15,
    color: "#455047",
    lineHeight: 24,
    marginBottom: 5,
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E3E7E1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listCardText: {
    fontSize: 16,
    color: "#26382A",
    textTransform: "capitalize",
  },
  removeText: {
    color: "#A04141",
    fontWeight: "600",
  },
  removeFavoriteText: {
    color: "#A04141",
    fontWeight: "600",
    marginTop: 14,
  },
  emptyText: {
    color: "#687268",
    fontSize: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#26382A",
    marginTop: 5,
  },
  profileEmail: {
    color: "#687268",
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#E3E7E1",
    paddingBottom: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#737B74",
    fontWeight: "600",
  },
  navTextActive: {
    color: "#345E3D",
    fontWeight: "800",
  },
});
