
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9IBZo5K7GMesiufcCWjzqp2MWFXc42vw",
  authDomain: "hackathon-a7df2.firebaseapp.com",
  projectId: "hackathon-a7df2",
  storageBucket: "hackathon-a7df2.appspot.com",
  messagingSenderId: "210288832491",
  appId: "1:210288832491:web:ba7dd10c2b2d3efbc2f3ae",
  measurementId: "G-B2K70XQ285",
};
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();

    // Signup Function
    function signup(e) {
    e.preventDefault();

    // Retrieve form values
    const email = document.getElementById("inputEmail4").value.trim();
    const password = document.getElementById("inputPassword4").value.trim();

    if (!email || !password) {
        alert("Please fill out both email and password fields.");
        return;
    }

    if (password.length < 6) {
        alert("Password should be at least 6 characters long.");
        return;
    }

    // Firebase signup
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        const user = userCredential.user;
        console.log("User signed up:", user);
        alert(`Sign up successful! Welcome, ${user.email}`);
        window.location.href = "login.html"; // Redirect to login page
        })
        .catch((error) => {
        console.error("Error signing up:", error.code, error.message);
        alert("Error: " + error.message);
        });
    }

    // Login Function
    function signin(e) {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById("inputEmail4").value.trim();
    const password = document.getElementById("inputPassword4").value.trim();

    if (!email || !password) {
        alert("Please fill out both email and password fields.");
        return;
    }

    // Firebase login
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        const user = userCredential.user;
        console.log("Signed in successfully:", user);
        alert(`Welcome back, ${user.email}!`);
        sessionStorage.setItem("user", JSON.stringify({ email: user.email })); // Store user info
        window.location.href = "index.html"; // Redirect to home page
        })
        .catch((error) => {
        console.error("Error signing in:", error.code, error.message);
        alert("Invalid email or password. Please try again.");
        });
    }

    // Attach event listeners
    document.getElementById("signUpForm")?.addEventListener("submit", signup);
    document.getElementById("loginButton")?.addEventListener("click", signin);

    const db = getFirestore();

function checkAuthState() {
  const createPostButton = document.getElementById("createPostButton");
  const loginMessage = document.getElementById("loginMessage");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is logged in:", user.email);
      if (createPostButton) createPostButton.style.display = "block";
      if (loginMessage) loginMessage.textContent = `Welcome, ${user.email}`;
    } else {
      console.log("No user is logged in.");
      if (createPostButton) createPostButton.style.display = "none";
      if (loginMessage) loginMessage.textContent = "You must log in to create a post.";
    }
  });
}

checkAuthState();

// Post Submission
document.addEventListener("DOMContentLoaded", () => {
  const postForm = document.getElementById("postForm");

  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const postContent = document.getElementById("postContent").value;

      // Ensure user is logged in
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Add post to Firestore
            const docRef = await addDoc(collection(db, "posts"), {
              content: postContent,
              userEmail: user.email,
              timestamp: Date.now(),
            });
            alert("Post created successfully!");
            window.location.href = "index.html"; // Redirect to index page
          } catch (error) {
            console.error("Error adding post:", error);
            alert("Failed to create post. Please try again.");
          }
        } else {
          alert("You must be logged in to create a post.");
        }
      });
    });
  } else {
    console.error("Error: postForm not found.");
  }
});

// Display posts on the index page
async function displayPosts() {
  const postsContainer = document.getElementById("postsContainer");

  if (!postsContainer) {
    console.error("Error: postsContainer element not found in the DOM.");
    return;
  }

  postsContainer.innerHTML = "<p>Loading posts...</p>";

  try {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(postsQuery);

    postsContainer.innerHTML = ""; // Clear loading message

    if (querySnapshot.empty) {
      console.log("No posts found.");
      postsContainer.innerHTML = "<p>No posts yet. Be the first to post!</p>";
      return;
    }

    querySnapshot.forEach((doc) => {
      const post = doc.data();
      const postElement = document.createElement("div");
      postElement.innerHTML = `
        <div>
          <p><strong>${post.userEmail}</strong>: ${post.content}</p>
          <small>${new Date(post.timestamp).toLocaleString()}</small>
        </div>
        <hr>
      `;
      postsContainer.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    postsContainer.innerHTML = "<p>Failed to load posts. Please try again later.</p>";
  }
}

document.addEventListener("DOMContentLoaded", displayPosts);

          