import './style.css';
import './about-us.css';
import Clerk  from "@clerk/clerk-js";
import aboutUsContent from './about-us.txt?raw';

// Initialize variables
let clerk;
let isAssessmentGenerating = false;

const API_BASE = import.meta.env.PROD 
  ? `${window.location.protocol}//${window.location.host}/api`
  : 'http://localhost:5000/api';

// Add service-specific URLs
const USER_API = `${API_BASE}/user`;
const ASSESSMENT_API = `${API_BASE}/assessment`;
const PROGRESS_API = `${API_BASE}/progress`;

// Copy all functions from v1/main.js
function renderWelcomePage() {
  document.getElementById("app").innerHTML = `
    <div class="welcome-page">
      <div id="navbar-container"></div>
      <div class="welcome-content">
        <h1>Welcome to TechTunes, ${clerk.user.firstName || 'User'}! 👋</h1>
        <p>Ready to start your musical journey?</p>
        <button id="get-started-btn" class="get-started-button">Get Started</button>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);  // false means not on about page

  // Mount the user button
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add event listeners
  setupEventListeners();
}

function renderNavbar(container, isAboutPage) {
  const navbar = document.createElement('div');
  navbar.className = 'navbar';
  navbar.innerHTML = `
    <div class="nav-links">
      ${!isAboutPage ? '<a href="#" id="about-us-link">About Us</a>' : ''}
    </div>
    <div class="profile-dropdown">
      <img src="${clerk.user.imageUrl}" alt="Profile" class="profile-image"/>
      <div class="dropdown-content">
        <div id="user-button"></div>
        <button id="sign-out-btn" class="sign-out-button">Sign Out</button>
      </div>
    </div>
  `;
  container.prepend(navbar);

  // Add sign out functionality immediately after creating the button
  const signOutBtn = navbar.querySelector("#sign-out-btn");
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      try {
        await clerk.signOut();
        window.location.reload(); // Force page reload after sign out
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Failed to sign out. Please try again.');
      }
    });
  }
}

function renderAboutUsPage() {
  document.getElementById("app").innerHTML = `
    <div class="about-us-container">
      <div id="navbar-container"></div>
      <div class="about-us-section">
        <div class="about-content">
          <h2>${aboutUsContent.split('\n')[0]}</h2>
          <p>${aboutUsContent.split('\n')[1]}</p>

          <h3>${aboutUsContent.split('\n')[3]}</h3>
          <p>${aboutUsContent.split('\n')[4]}</p>

          <h3>${aboutUsContent.split('\n')[6]}</h3>
          <ul>
            <li>${aboutUsContent.split('\n')[8]}</li>
            <li>${aboutUsContent.split('\n')[9]}</li>
            <li>${aboutUsContent.split('\n')[10]}</li>
          </ul>

          <h3>${aboutUsContent.split('\n')[11]}</h3>
          <p>${aboutUsContent.split('\n')[12]}</p>

          <h3>${aboutUsContent.split('\n')[14]}</h3>
          <p>${aboutUsContent.split('\n')[15]}</p>
        </div>
        <div class="about-actions">
          <button id="home-btn" class="home-button">Go to Home</button>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), true);  // true means on about page
  
  // Mount the user button
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add event listeners
  setupEventListeners();
}

function renderHomePage() {
  document.getElementById("app").innerHTML = `
    <div class="home-page">
      <div id="navbar-container"></div>
      <div class="home-content">
        <h1>Music Dashboard</h1>
        <div class="dashboard-grid">
          <div class="dashboard-card">
            <h3>My Lessons</h3>
            <p>Continue your learning journey</p>
            <button class="dashboard-button">View Lessons</button>
          </div>
          <div class="dashboard-card">
            <h3>Practice Sessions</h3>
            <p>Track your practice progress</p>
            <button class="dashboard-button">Start Practice</button>
          </div>
          <div class="dashboard-card">
            <h3>My Progress</h3>
            <p>View your assessment results and learning progress</p>
            <button id="view-assessment-btn" class="dashboard-button">View Assessment Results</button>
          </div>
          <div class="dashboard-card">
            <h3>Resources</h3>
            <p>Access learning materials</p>
            <button class="dashboard-button">Browse Resources</button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add event listener for the assessment results button
  const viewAssessmentBtn = document.getElementById('view-assessment-btn');
  if (viewAssessmentBtn) {
    viewAssessmentBtn.addEventListener('click', async () => {
      try {
        const response = await fetch(`${API_BASE}/get-latest-assessment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            userId: clerk.user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.assessment) {
            renderAssessmentResults(data.assessment.results, data.assessment.score);
          } else {
            alert('No assessment results found. Take an assessment first!');
          }
        } else {
          throw new Error('Failed to fetch assessment results');
        }
      } catch (error) {
        console.error('Error fetching assessment results:', error);
        alert('Failed to load assessment results. Please try again.');
      }
    });
  }

  setupEventListeners();
}

function renderWelcomeBackPage() {
  document.getElementById("app").innerHTML = `
    <div class="welcome-page">
      <div id="navbar-container"></div>
      <div class="welcome-content">
        <h1>Welcome Back, ${clerk.user.firstName || 'User'}! 👋</h1>
        <p>Let's continue your musical journey from where you left off...</p>
        <button id="go-to-home-btn" class="primary-button">Go to Dashboard</button>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);
  setupEventListeners();
}

function setupEventListeners() {
  // Add about us page navigation if link exists
  const aboutUsLink = document.getElementById("about-us-link");
  if (aboutUsLink) {
    aboutUsLink.addEventListener("click", (e) => {
      e.preventDefault();
      renderAboutUsPage();
    });
  }

  // Add get started button functionality
  const getStartedBtn = document.getElementById("get-started-btn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
      renderHomePage();
    });
  }

  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      renderHomePage();
    });
  }

  const goToHomeBtn = document.getElementById("go-to-home-btn");
  if (goToHomeBtn) {
    goToHomeBtn.addEventListener("click", () => {
      renderHomePage();
    });
  }
}

function renderGoalPage() {
  const instruments = [
    { id: 'keyboard', name: 'Keyboard', icon: '🎹' },
    { id: 'strings', name: 'Strings', icon: '🎻' },
    { id: 'theory', name: 'Music Theory', icon: '📚' },
    { id: 'voice', name: 'Voice', icon: '🎤' },
    { id: 'teaching', name: 'Teaching', icon: '👨‍🏫' },
    { id: 'percussion', name: 'Percussion', icon: '🥁' },
    { id: 'woodwind', name: 'Woodwind', icon: '🎷' },
    { id: 'brass', name: 'Orchestral Brass', icon: '🎺' }
  ];

  document.getElementById("app").innerHTML = `
    <div class="goal-page">
      <div id="navbar-container"></div>
      <div class="goal-content">
        <h1>What would you like to learn?</h1>
        <p>Choose your musical journey</p>
        
        <div class="goals-grid">
          ${instruments.map(instrument => `
            <div class="goal-card" data-goal="${instrument.id}">
              <div class="goal-icon">${instrument.icon}</div>
              <h3>${instrument.name}</h3>
              <div class="selection-indicator"></div>
            </div>
          `).join('')}
        </div>

        <div class="goal-actions">
          <button id="continue-btn" class="continue-button" disabled>
            Continue
          </button>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add selection functionality
  const goalCards = document.querySelectorAll('.goal-card');
  const continueBtn = document.getElementById('continue-btn');
  let selectedGoal = null;

  goalCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove previous selection
      goalCards.forEach(c => c.classList.remove('selected'));
      // Add new selection
      card.classList.add('selected');
      selectedGoal = card.dataset.goal;
      continueBtn.disabled = false;
    });
  });

  // Handle continue button
  continueBtn.addEventListener('click', async () => {
    if (selectedGoal) {
      // Save user's goal
      try {
        const response = await fetch(`${USER_API}/save-goal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: clerk.user.id,
            email: clerk.user.primaryEmailAddress?.emailAddress,
            goal: selectedGoal,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          renderProficiencyPage(selectedGoal);
        } else {
          throw new Error('Failed to save goal');
        }
      } catch (error) {
        console.error('Error saving goal:', error);
        // Continue anyway
        renderProficiencyPage(selectedGoal);
      }
    }
  });
}

function renderProficiencyPage(selectedGoal) {
  const levels = [
    { id: 'preliminary', name: 'Preliminary', description: 'Just starting out' },
    { id: 'grade1', name: 'Grade 1', description: 'Basic fundamentals' },
    { id: 'grade2', name: 'Grade 2', description: 'Early intermediate' },
    { id: 'grade3', name: 'Grade 3', description: 'Intermediate' },
    { id: 'grade4', name: 'Grade 4', description: 'Upper intermediate' },
    { id: 'grade5', name: 'Grade 5', description: 'Lower advanced' },
    { id: 'grade6', name: 'Grade 6', description: 'Advanced' },
    { id: 'grade7', name: 'Grade 7', description: 'Advanced plus' },
    { id: 'grade8', name: 'Grade 8', description: 'Expert' }
  ];

  document.getElementById("app").innerHTML = `
    <div class="goal-page">
      <div id="navbar-container"></div>
      <div class="goal-content">
        <h1>What's your current level?</h1>
        <p>Select your proficiency level in ${selectedGoal}</p>
        
        <div class="proficiency-grid">
          ${levels.map(level => `
            <div class="proficiency-card" data-level="${level.id}">
              <h3>${level.name}</h3>
              <p>${level.description}</p>
              <div class="selection-indicator"></div>
            </div>
          `).join('')}
        </div>

        <div class="goal-actions">
          <button id="continue-btn" class="continue-button" disabled>
            Continue
          </button>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add selection functionality
  const proficiencyCards = document.querySelectorAll('.proficiency-card');
  const continueBtn = document.getElementById('continue-btn');
  let selectedLevel = null;

  proficiencyCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove previous selection
      proficiencyCards.forEach(c => c.classList.remove('selected'));
      // Add new selection
      card.classList.add('selected');
      selectedLevel = card.dataset.level;
      continueBtn.disabled = false;
    });
  });

  // Handle continue button
  continueBtn.addEventListener('click', async () => {
    if (selectedLevel) {
      try {
        const response = await fetch(`${USER_API}/save-proficiency`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: clerk.user.id,
            email: clerk.user.primaryEmailAddress?.emailAddress,
            goal: selectedGoal,
            proficiencyLevel: selectedLevel,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          renderLearningPathPage(selectedGoal, selectedLevel);
        } else {
          throw new Error('Failed to save proficiency level');
        }
      } catch (error) {
        console.error('Error saving proficiency level:', error);
        // Continue anyway
        renderLearningPathPage(selectedGoal, selectedLevel);
      }
    }
  });
}

// Add this helper function to convert proficiency level to grade number
function proficiencyToGrade(proficiencyLevel) {
    const gradeMap = {
        'preliminary': 1,
        'grade1': 1,
        'grade2': 2,
        'grade3': 3,
        'grade4': 4,
        'grade5': 5,
        'grade6': 6,
        'grade7': 7,
        'grade8': 8
    };
    return gradeMap[proficiencyLevel] || 1;
}

function renderLearningPathPage(selectedGoal, proficiencyLevel) {
  document.getElementById("app").innerHTML = `
    <div class="goal-page">
      <div id="navbar-container"></div>
      <div class="goal-content">
        <h1>How would you like to get started?</h1>
        <p>Choose your learning path for ${selectedGoal}</p>
        
        <div class="learning-path-container">
          <div class="learning-path-grid">
            <!-- Commented out for future use
            <div class="learning-path-card" data-path="scratch">
              <div class="path-icon">🌱</div>
              <h3>Start from Scratch</h3>
              <p>Begin with the fundamentals and build a strong foundation, regardless of your current level.</p>
            </div>
            -->
            
            <div class="learning-path-card" data-path="assessment">
              <div class="path-icon">🎯</div>
              <h3>Find My Level</h3>
              <p>Take an assessment to identify your strengths and areas for improvement.</p>
            </div>
          </div>

          <div class="goal-actions">
            <button id="continue-btn" class="continue-button" disabled>
              Continue
              <span id="loading-spinner" class="spinner hidden"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add selection functionality
  const pathCards = document.querySelectorAll('.learning-path-card');
  const continueBtn = document.getElementById('continue-btn');
  let selectedPath = null;

  pathCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove previous selection
      pathCards.forEach(c => c.classList.remove('selected'));
      // Add new selection
      card.classList.add('selected');
      selectedPath = card.dataset.path;
      continueBtn.disabled = false;
    });
  });

  // Handle continue button
  continueBtn.addEventListener('click', async () => {
    if (selectedPath) {
      try {
        // Disable button and show loading state
        continueBtn.disabled = true;
        const loadingSpinner = document.getElementById('loading-spinner');
        loadingSpinner.classList.remove('hidden');

        if (selectedPath === 'assessment') {
          // Redirect to question count selection page
          renderQuestionCountPage(selectedGoal, proficiencyLevel);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        // Re-enable button on error
        continueBtn.disabled = false;
        const loadingSpinner = document.getElementById('loading-spinner');
        loadingSpinner.classList.add('hidden');
        continueBtn.textContent = 'Continue';
      }
    }
  });
}

function renderQuestionCountPage(selectedGoal, proficiencyLevel) {
  try {
    // If assessment is already being generated, ignore the request
    if (isAssessmentGenerating) {
      console.log('Assessment generation already in progress');
      return;
    }

    console.log('1. Starting assessment generation', { selectedGoal, proficiencyLevel });
    
    // Set the flag to true
    isAssessmentGenerating = true;
    
    // Disable all assessment-related buttons
    const startAssessmentBtn = document.getElementById('start-assessment-btn');
    const findLevelBtn = document.querySelector('[data-path="assessment"]');
    
    if (startAssessmentBtn) {
      startAssessmentBtn.disabled = true;
      startAssessmentBtn.innerHTML = `
        <span class="spinner"></span>
        Preparing Your Assessment...
      `;
    }
    
    if (findLevelBtn) {
      findLevelBtn.classList.add('disabled');
      findLevelBtn.style.pointerEvents = 'none';
    }

    let retryCount = 0;
    const maxRetries = 2;

    function attemptAssessmentGeneration() {
      fetch(`${USER_API}/save-learning-path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: clerk.user.id,
          email: clerk.user.primaryEmailAddress?.emailAddress,
          goal: selectedGoal,
          proficiencyLevel: proficiencyLevel,
          learningPath: 'assessment',
          questionCount: 5,
          timestamp: new Date().toISOString()
        })
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Failed to save learning path: ${text}`);
          });
        }
        return fetch(`${ASSESSMENT_API}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: clerk.user.id,
            email: clerk.user.primaryEmailAddress?.emailAddress,
            instrument: selectedGoal,
            grade: proficiencyToGrade(proficiencyLevel),
            questionCount: 5
          })
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`Failed to generate assessment: ${text}`);
          });
        }
        return response.json();
      })
      .then(assessmentData => {
        // Validate assessment data structure
        if (!assessmentData.assessment?.topics?.Topics || !assessmentData.assessment?.mcqs?.MCQs) {
          throw new Error('Invalid assessment data structure received');
        }

        // Verify that all topics have corresponding MCQs
        const topicCount = Object.keys(assessmentData.assessment.topics.Topics).length;
        const mcqCount = Object.keys(assessmentData.assessment.mcqs.MCQs).length;
        
        if (topicCount !== mcqCount) {
          throw new Error(`Mismatch in questions: ${mcqCount} MCQs for ${topicCount} topics`);
        }

        localStorage.setItem('currentAssessment', JSON.stringify(assessmentData.assessment));
        isAssessmentGenerating = false; // Reset the flag on success
        renderAssessmentIntroPage(selectedGoal);
      })
      .catch(error => {
        console.error('Error in assessment generation:', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          // Show retry message
          if (startAssessmentBtn) {
            startAssessmentBtn.innerHTML = `
              <span class="spinner"></span>
              Retrying... (Attempt ${retryCount + 1})
            `;
          }
          // Wait a second before retrying
          setTimeout(attemptAssessmentGeneration, 1000);
        } else {
          // Reset the flag and re-enable buttons on final failure
          isAssessmentGenerating = false;
          if (startAssessmentBtn) {
            startAssessmentBtn.disabled = false;
            startAssessmentBtn.innerHTML = `
              Try Again
              <span class="error-icon">⚠️</span>
            `;
          }
          if (findLevelBtn) {
            findLevelBtn.classList.remove('disabled');
            findLevelBtn.style.pointerEvents = 'auto';
          }
          // Show error message to user
          const errorContainer = document.createElement('div');
          errorContainer.className = 'error-message';
          errorContainer.innerHTML = `
            <p>Failed to generate assessment. Please try again.</p>
            <p class="error-details">${error.message}</p>
          `;
          startAssessmentBtn.parentNode.insertBefore(errorContainer, startAssessmentBtn.nextSibling);
        }
      });
    }

    // Start the first attempt
    attemptAssessmentGeneration();

  } catch (error) {
    // Reset the flag and re-enable buttons on error
    isAssessmentGenerating = false;
    if (startAssessmentBtn) {
      startAssessmentBtn.disabled = false;
      startAssessmentBtn.innerHTML = 'Start Assessment';
    }
    if (findLevelBtn) {
      findLevelBtn.classList.remove('disabled');
      findLevelBtn.style.pointerEvents = 'auto';
    }
    console.error('Error in renderQuestionCountPage:', error);
    alert('An error occurred while setting up the assessment. Please try again.');
  }
}

function renderAssessmentIntroPage(selectedGoal) {
  try {
    console.log('10. Starting renderAssessmentIntroPage');
    document.getElementById("app").innerHTML = `
      <div class="goal-page">
        <div id="navbar-container"></div>
        <div class="goal-content">
          <h1>Level Assessment</h1>
          <div class="assessment-intro">
            <div class="intro-icon">📝</div>
            <h2>Let's Find Your Perfect Starting Point</h2>
            <p>You'll be answering questions about ${selectedGoal} to help us:</p>
            <ul class="intro-points">
              <li>Determine your current skill level</li>
              <li>Identify your strengths and areas for improvement</li>
              <li>Create a personalized learning journey</li>
              <li>Provide relevant practice materials</li>
              <li>Track your progress effectively</li>
            </ul>
            <p class="intro-note">This will take approximately 5-10 minutes to complete.</p>
            <div class="intro-actions">
              <button id="start-assessment-btn" class="primary-button">
                Start Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    console.log('11. Intro page DOM updated');

    // Then render the navbar
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
      throw new Error('Navbar container not found in intro page');
    }
    renderNavbar(navbarContainer, false);
    
    console.log('12. Intro page navbar rendered');

    // Add event listener for start assessment button
    const startAssessmentBtn = document.getElementById("start-assessment-btn");
    if (!startAssessmentBtn) {
      throw new Error('Start assessment button not found');
    }

    startAssessmentBtn.addEventListener("click", () => {
      console.log('13. Start assessment button clicked');
      renderAssessmentPage(selectedGoal);
    });

    // Mount user button last
    setTimeout(() => {
      const userButtonDiv = document.getElementById("user-button");
      if (userButtonDiv) {
        clerk.mountUserButton(userButtonDiv);
        console.log('14. User button mounted in intro page');
      }
    }, 100);

  } catch (error) {
    console.error('Error in renderAssessmentIntroPage:', error);
    alert('An error occurred while setting up the assessment intro page. Please try again.');
  }
}

// Add this helper function for API calls
async function makeAPICall(endpoint, method = 'POST', data = null) {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : null
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Then update one API call at a time to use this helper
async function saveAnswer(questionNumber, answer, question) {
  return makeAPICall('save-answer', 'POST', {
    userId: clerk.user.id,
    email: clerk.user.primaryEmailAddress?.emailAddress,
    questionNumber: questionNumber + 1,
    topicNumber: `Topic ${questionNumber + 1}`,
    selectedAnswer: answer.choice,
    correctAnswer: question.correct,
    isCorrect: answer.choice === question.correct,
    timestamp: new Date().toISOString()
  });
}

// Function to handle assessment completion
async function finishAssessment(state) {
  const assessment = JSON.parse(localStorage.getItem('currentAssessment'));
  const mcqs = assessment.mcqs.MCQs;
  const topics = assessment.topics.Topics;

  // Calculate score and analyze strengths/weaknesses
  const totalQuestions = Object.keys(state.answers).length;
  const results = {
    correctAnswers: 0,
    strengths: [],
    weaknesses: [],
    details: []
  };

  Object.entries(state.answers).forEach(([questionNum, answer]) => {
    const topicNum = `Topic ${parseInt(questionNum) + 1}`;
    const question = mcqs[topicNum][0];
    const isCorrect = answer.choice === question.correct;
    
    results.details.push({
      topicNum,
      topic: topics[topicNum],
      question: question.question,
      userAnswer: answer.choice,
      correctAnswer: question.correct,
      isCorrect,
      feedback: question.feedback
    });

    if (isCorrect) {
      results.correctAnswers++;
      results.strengths.push(topics[topicNum]);
    } else {
      results.weaknesses.push(topics[topicNum]);
    }
  });

  const score = (results.correctAnswers / totalQuestions) * 100;

  try {
    const response = await fetch(`${PROGRESS_API}/complete-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: clerk.user.id,
        email: clerk.user.primaryEmailAddress?.emailAddress,
        score,
        results,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      renderAssessmentResults(results, score);
    } else {
      throw new Error('Failed to save assessment results');
    }
  } catch (error) {
    console.error('Error completing assessment:', error);
    alert('An error occurred while saving your results. Please try again.');
  }
}

function renderAssessmentResults(results, score) {
  document.getElementById("app").innerHTML = `
    <div class="assessment-results-page">
      <div id="navbar-container"></div>
      <div class="results-content">
        <div class="results-header">
          <h1>Assessment Results</h1>
          <div class="score-display">
            <div class="score-circle ${score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'}">
              ${Math.round(score)}%
            </div>
            <p>You got ${results.correctAnswers} out of ${results.details.length} questions correct</p>
          </div>
        </div>

        <div class="strengths-weaknesses">
          <div class="strength-section">
            <h2>Your Strengths</h2>
            ${results.strengths.length > 0 ? `
              <ul class="strength-list">
                ${results.strengths.map(topic => `
                  <li><span class="check-icon">✓</span> ${topic}</li>
                `).join('')}
              </ul>
            ` : '<p>Keep practicing to develop your strengths!</p>'}
          </div>

          <div class="weakness-section">
            <h2>Areas for Improvement</h2>
            ${results.weaknesses.length > 0 ? `
              <ul class="weakness-list">
                ${results.weaknesses.map(topic => `
                  <li><span class="x-icon">✗</span> ${topic}</li>
                `).join('')}
              </ul>
            ` : '<p>Great job! You\'ve mastered all topics!</p>'}
          </div>
        </div>

        <div class="detailed-review">
          <h2>Detailed Review</h2>
          ${results.details.map((detail, index) => `
            <div class="question-review ${detail.isCorrect ? 'correct' : 'incorrect'}">
              <div class="question-header">
                <span class="question-number">Question ${index + 1}</span>
                <span class="result-indicator">${detail.isCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
              </div>
              <h3>${detail.topic}</h3>
              <p class="question-text">${detail.question}</p>
              <div class="answer-details">
                <p>Your answer: Option ${detail.userAnswer}</p>
                ${!detail.isCorrect ? `<p>Correct answer: Option ${detail.correctAnswer}</p>` : ''}
              </div>
              <div class="feedback">
                <p>${detail.feedback}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="results-actions">
          <button id="go-to-dashboard" class="primary-button">Go to Dashboard</button>
        </div>
      </div>
    </div>
  `;

  renderNavbar(document.getElementById('navbar-container'), false);
  const userButtonDiv = document.getElementById("user-button");
  clerk.mountUserButton(userButtonDiv);

  // Add event listener for dashboard button
  document.getElementById('go-to-dashboard').addEventListener('click', () => {
    renderHomePage();
  });
}

// Add this function after renderAssessmentIntroPage
function renderAssessmentPage(selectedGoal) {
  try {
    console.log('Starting renderAssessmentPage');
    const assessmentData = localStorage.getItem('currentAssessment');
    // Add debug logging here
    console.log('Assessment Data:', JSON.parse(assessmentData));
    
    const assessment = JSON.parse(assessmentData);
    if (!assessment.topics?.Topics || !assessment.mcqs?.MCQs) {
      throw new Error('Invalid assessment data structure');
    }

    const state = {
      currentQuestion: 0,
      answers: {},
      totalQuestions: Object.keys(assessment.mcqs.MCQs).length
    };
    console.log('Initial state:', state);

    function renderQuestion() {
      // Find the next available topic with an MCQ
      let topicNum;
      let question;
      
      do {
        topicNum = `Topic ${state.currentQuestion + 1}`;
        question = assessment.mcqs.MCQs[topicNum]?.[0];
        if (!question) {
          state.currentQuestion++;
        }
      } while (!question && state.currentQuestion < Object.keys(assessment.topics.Topics).length);

      if (!question) {
        console.error('No more questions available');
        finishAssessment(state);
        return;
      }

      const topic = assessment.topics.Topics[topicNum];
      const progress = ((state.currentQuestion + 1) / state.totalQuestions) * 100;
      const hasAnswered = state.answers[state.currentQuestion]?.submitted;

      document.getElementById("app").innerHTML = `
        <div class="assessment-page">
          <div id="navbar-container"></div>
          <div class="assessment-content">
            <div class="assessment-header">
              <h1>Level Assessment</h1>
              <div class="progress-bar" role="progressbar" 
                   aria-valuenow="${progress}" 
                   aria-valuemin="0" 
                   aria-valuemax="100">
                <div class="progress" style="width: ${progress}%"></div>
                <span>Question ${state.currentQuestion + 1} of ${state.totalQuestions}</span>
              </div>
            </div>
            <div class="question-container">
              <div class="topic-header">Topic: ${topic}</div>
              <div class="question">
                <h3>${question.question}</h3>
                <div class="options">
                  ${Object.entries(question.options).map(([letter, text]) => `
                    <div class="option ${hasAnswered ? (
                      letter === question.correct ? 'correct' :
                      letter === state.answers[state.currentQuestion]?.choice ? 'incorrect' : ''
                    ) : (state.answers[state.currentQuestion]?.choice === letter ? 'selected' : '')}">
                      <input type="radio" 
                        id="option${letter}" 
                        name="question${state.currentQuestion}" 
                        value="${letter}"
                        ${state.answers[state.currentQuestion]?.choice === letter ? 'checked' : ''}
                        ${hasAnswered ? 'disabled' : ''}
                      >
                      <label for="option${letter}">${letter}) ${text}</label>
                    </div>
                  `).join('')}
                </div>
                ${hasAnswered ? `
                  <div class="feedback ${state.answers[state.currentQuestion].choice === question.correct ? 'correct' : 'incorrect'}">
                    <div class="feedback-header">
                      ${state.answers[state.currentQuestion].choice === question.correct ? 
                        '✓ Correct!' : 
                        `✗ Incorrect. The correct answer is ${question.correct}.`
                      }
                    </div>
                    <p>${question.feedback}</p>
                  </div>
                ` : ''}
              </div>
              ${!hasAnswered && state.answers[state.currentQuestion]?.choice ? `
                <div class="question-actions">
                  <button id="submit-answer" class="submit-answer-button">Submit Answer</button>
                </div>
              ` : ''}
              ${hasAnswered ? `
                <div class="question-actions">
                  <button id="continue-question" class="continue-button">
                    ${state.currentQuestion === state.totalQuestions - 1 ? 'Finish Assessment' : 'Next Question'}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      // Render navbar and mount user button
      renderNavbar(document.getElementById('navbar-container'), false);
      const userButtonDiv = document.getElementById("user-button");
      clerk.mountUserButton(userButtonDiv);

      // Add event listeners
      setupQuestionEventListeners();
    }

    function setupQuestionEventListeners() {
      // Add event listeners to options
      const options = document.querySelectorAll('.option input');
      options.forEach(option => {
        option.addEventListener('change', () => {
          if (!state.answers[state.currentQuestion]?.submitted) {
            state.answers[state.currentQuestion] = {
              choice: option.value,
              submitted: false
            };
            renderQuestion();
          }
        });
      });

      // Add submit answer event listener
      const submitAnswerBtn = document.getElementById('submit-answer');
      if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', async () => {
          const topicNum = `Topic ${state.currentQuestion + 1}`;
          const question = assessment.mcqs.MCQs[topicNum][0];
          state.answers[state.currentQuestion].submitted = true;
          await saveAnswer(state.currentQuestion, state.answers[state.currentQuestion], question);
          renderQuestion();
        });
      }

      // Add continue button event listener
      const continueBtn = document.getElementById('continue-question');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          // Add debug logging
          console.log('Continue clicked:', {
            currentQuestion: state.currentQuestion,
            totalQuestions: state.totalQuestions,
            isLastQuestion: state.currentQuestion === state.totalQuestions - 1
          });
          
          if (state.currentQuestion === state.totalQuestions - 1) {
            finishAssessment(state);
          } else {
            state.currentQuestion++;
            renderQuestion();
          }
        });
      }
    }

    // Start rendering the first question
    renderQuestion();

  } catch (error) {
    console.error('Error in renderAssessmentPage:', error);
    alert('Failed to load assessment. Please try again.');
  }
}

// New initialization using async/await
async function initClerk() {
    const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
    clerk = new Clerk(clerkPubKey);
    await clerk.load();
    
    if (clerk.user) {
        try {
            const hasGoals = await checkUserGoals(clerk.user.id);
            
            if (hasGoals) {
                if (clerk.user.lastSignInAt) {
                    renderWelcomeBackPage();
                } else {
                    renderHomePage();
                }
            } else {
                renderGoalPage();
            }
        } catch (error) {
            console.error('Error during initialization:', error);
            renderGoalPage(); // Fallback to goal page
        }
    } else {
        document.getElementById("app").innerHTML = `
            <div class="sign-in-container">
                <h1>Welcome to TechTunes</h1>
                <p>Your musical journey begins here</p>
                
                <div class="auth-options">
                    <button id="get-started-btn" class="auth-button primary-button">
                        Get Started
                    </button>
                    <div class="divider">
                        <span>or</span>
                    </div>
                    <button id="sign-in-btn" class="auth-button secondary-button">
                        I Already Have an Account
                    </button>
                </div>
                
                <div id="sign-in" class="hidden"></div>
            </div>
        `;

        const signInDiv = document.getElementById("sign-in");
        const getStartedBtn = document.getElementById("get-started-btn");
        const signInBtn = document.getElementById("sign-in-btn");
        
        getStartedBtn.addEventListener("click", () => {
            clerk.openSignUp();
        });

        signInBtn.addEventListener("click", () => {
            clerk.openSignIn();
        });
    }
}

// Start the app
initClerk().catch(error => {
    console.error('Error initializing app:', error);
    document.getElementById("app").innerHTML = `
        <div class="error-container">
            <h1>Oops! Something went wrong</h1>
            <p>Error: ${error.message}</p>
            <button onclick="window.location.reload()">Try Again</button>
        </div>
    `;
});

export { clerk };

