// Using global fetch (available in Node.js 18+)

const BASE_URL = "http://localhost:3000/api";
let cookie = "";
let userId = "";
let taskId = "";
let quizId = "";

async function testEndpoint(name, url, method = "GET", body = null) {
  console.log(`\nTesting ${name}...`);
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (cookie) {
    options.headers["Cookie"] = cookie;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    console.log(`Status: ${response.status}`);

    // Capture cookie from sign-in/sign-up
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      cookie = setCookie.split(";")[0];
      console.log("Cookie captured");
    }

    if (response.ok) {
      console.log("Success!");
      return data;
    } else {
      console.log("Failed:", data.message || response.statusText);
      return null;
    }
  } catch (error) {
    console.error(`Error testing ${name}:`, error.message);
    return null;
  }
}

async function runTests() {
  const email = `test-${Date.now()}@example.com`;
  const password = "Password123!";
  const name = "Test User";

  // 1. Sign Up
  const signUpRes = await testEndpoint("Sign Up", "/auth/sign-up", "POST", {
    email,
    password,
    name,
    role: "user",
  });

  if (!signUpRes) {
    console.log("Sign up failed, trying sign in with known user if exists...");
  }

  // 2. Sign In
  cookie = ""; // Clear cookie to test fresh sign-in
  const signInRes = await testEndpoint("Sign In", "/auth/sign-in", "POST", {
    email: email, // Use the one we just created
    password: password,
  });

  if (!signInRes) {
    console.error("Sign in failed, cannot proceed with authenticated tests");
    return;
  }

  userId = signInRes.user?.user?.id || signInRes.user?.id;
  console.log(`User ID: ${userId}`);

  // 3. Get Me
  await testEndpoint("Get Me", `/auth/me/${userId}`);

  // 4. Get Balance
  const balanceRes = await testEndpoint("Get Balance", "/economy/balance");

  // 5. Create Task
  const taskRes = await testEndpoint("Create Task", "/task/booking", "POST", {
    title: "Test Task",
    description: "This is a test task",
    stake: 10,
  });

  if (taskRes && taskRes.task) {
    taskId = taskRes.task.id;
    console.log(`Task ID: ${taskId}`);
  }

  // 6. Get Today's Tasks
  await testEndpoint("Get Today Tasks", "/task/today");

  // 7. Generate Quiz
  if (taskId) {
    const quizRes = await testEndpoint(
      "Generate Quiz",
      "/quiz/generate",
      "POST",
      {
        taskId,
      }
    );
    if (quizRes && quizRes.quizId) {
      quizId = quizRes.quizId;
    }
  }

  // 8. Submit Quiz
  if (quizId) {
    await testEndpoint("Submit Quiz", "/quiz/submit", "POST", {
      quizId,
      answers: ["A", "B", "C", "D", "E"], // Dummy answers
    });
  }

  // 9. Close Day
  await testEndpoint("Close Day", "/task/close-day", "POST", {});

  // 10. Get Transactions
  await testEndpoint("Get Transactions", "/economy/transaction");

  // 11. Get Leaderboard
  await testEndpoint("Get Leaderboard", "/leaderboard");

  // 12. Get User Stats
  await testEndpoint("Get User Stats", `/leaderboard/${userId}`);

  // 13. Sign Out
  await testEndpoint("Sign Out", "/auth/sign-out", "POST", {});

  console.log("\n--- API Verification Complete ---");
}

runTests();
