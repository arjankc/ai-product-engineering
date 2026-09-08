const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoPath = 'c:\\\\Users\\\\Arjan\\\\OneDrive\\\\Documents\\\\GitHub\\\\ai-product-engineering';
process.chdir(repoPath);

const tracks = [
  {
    track: 1, slug: 'context-aware-academic-assistant', title: 'Context-Aware Academic Assistant',
    vault: {
      'Syllabus.md': '# CS101 Syllabus\\nGrading: 50% Exams, 50% Labs. Late penalty: 10% per day.',
      'Lecture-1.md': '# Lecture 1: Big O\\nProfessor strictly prefers O(n log n) algorithms for sorting. Bubble sort will result in zero marks.',
      'Assignment-1.md': '# Assignment 1\\nDue next Friday. Must be written in JavaScript. No external libraries allowed.'
    }
  },
  {
    track: 2, slug: 'smart-pantry-recipe-architect', title: 'Smart Pantry & Recipe Architect',
    vault: {
      'Dad-Profile.md': '# Dad Dietary Profile\\nSevere lactose intolerance. Always substitute butter with olive oil or dairy-free alternatives.',
      'Kid-Profile.md': '# Kid Dietary Profile\\nPeanut allergy. Cannot have anything processed in a facility with peanuts.',
      'Family-Recipes.md': "# Grandma's Pasta\\nBoil pasta, add tomatoes, garlic, and basil. Quick 15 min meal."
    }
  },
  {
    track: 3, slug: 'local-hardware-troubleshooting-bot', title: 'Local Hardware Troubleshooting Bot',
    vault: {
      'Network-Topology.md': '# Home Network\\nRouter IP: 192.168.1.1. Printer IP: 192.168.1.50 (Static). NAS IP: 192.168.1.100.',
      'Router-Manual.md': '# Nighthawk Router\\nIf the internet LED blinks amber, it means the router cannot negotiate a connection with the modem. Action: Restart modem first, then router.',
      'Printer-Manual.md': '# Epson L3150\\nError code E-11 means the ink pad is at the end of its service life. Do not attempt to print.'
    }
  },
  {
    track: 4, slug: 'travel-log-itinerary-copilot', title: 'Travel Log & Itinerary Copilot',
    vault: {
      'Preferences.md': '# Travel Preferences\\nI hate crowded tourist traps. I prefer quiet cafes, walking tours, and vegan-friendly restaurants.',
      'Past-Trip-Tokyo.md': '# Tokyo 2024\\nLoved the small alleyways in Shimokitazawa. The matcha latte at that corner shop was 5/5. Hated the crowds at Shibuya crossing.',
      'Upcoming-Trip-Paris.md': '# Paris 2026 Ideas\\nNeed to find a vegan bakery near Montmartre. Budget is 50 EUR/day for food.'
    }
  },
  {
    track: 5, slug: 'personal-fitness-rehab-coach', title: 'Personal Fitness & Rehab Coach',
    vault: {
      'PT-Notes-Shoulder.md': '# Physical Therapy: Left Shoulder\\nRotator cuff tendinitis. Avoid any heavy overhead pressing. Substitute overhead press with front raises or lateral raises using light bands.',
      'Knee-Log.md': '# Right Knee\\nOccasional pain during deep squats. Limit squat depth to parallel or use leg press instead.',
      'Current-Routine.md': '# Push Day\\nFocus on chest and triceps. Need to ensure shoulder is warmed up properly for 10 minutes before starting.'
    }
  },
  {
    track: 6, slug: 'automated-expense-tax-analyst', title: 'Automated Expense & Tax Analyst',
    vault: {
      'Budget-2026.md': '# 2026 Monthly Budget\\nDining: $300. Groceries: $400. Utilities: $150. Business Software: $100.',
      'Tax-Deductions.md': '# Freelance Tax Rules\\nMeals with clients are 50% deductible. Software subscriptions for design/code are 100% deductible.',
      'July-Summary.md': '# July Expenses\\nAlready spent $250 on dining. Nearing the limit.'
    }
  },
  {
    track: 7, slug: 'household-plant-care-botany-assistant', title: 'Household Plant Care & Botany Assistant',
    vault: {
      'Monstera-Log.md': '# Monstera Deliciosa\\nRepotted in March. Using chunky soil mix. Water only when top 2 inches are dry. Prefers bright indirect light.',
      'Balcony-Herbs.md': '# Basil & Mint\\nOn the south balcony. Needs daily watering in summer. Bring inside if temperature drops below 10C.',
      'Fiddle-Leaf.md': '# Fiddle Leaf Fig\\nVery dramatic. Dropped two leaves last week. Might be reacting to the AC draft.'
    }
  },
  {
    track: 8, slug: 'tabletop-rpg-board-game-master', title: 'Tabletop RPG / Board Game Master',
    vault: {
      'House-Rules.md': '# Campaign House Rules\\nPotions take a bonus action to drink. Flanking gives +2 to hit, not advantage.',
      'NPC-Directory.md': '# The Blacksmith\\nName: Grom. Gruff dwarf. Missing his left thumb. Will give a 10% discount if you bring him rare ores.',
      'Session-12-Summary.md': '# Last Session\\nThe party defeated the goblin king but the rogue stole the cursed amulet. The wizard is currently at 5 HP.'
    }
  },
  {
    track: 9, slug: 'local-heritage-architecture-guide', title: 'Local Heritage & Architecture Guide',
    vault: {
      'Swayambhunath.md': '# Swayambhunath Stupa\\nAlso known as the Monkey Temple. The eyes painted on the stupa represent Wisdom and Compassion.',
      'Newari-Architecture.md': '# Wood Carving\\nThe intricately carved wooden struts often depict multi-armed deities. The traditional window is called a "Desay Madu Jhya".',
      'Patan-Durbar.md': '# Patan Durbar Square\\nFeatures the Krishna Mandir, built in the 17th century entirely of stone. Distinctive Shikhara style.'
    }
  },
  {
    track: 10, slug: 'home-maintenance-diy-helper', title: 'Home Maintenance & DIY Helper',
    vault: {
      'Lease-Agreement.md': '# Rental Lease\\nTenant is responsible for replacing lightbulbs and AC filters. Landlord handles plumbing and major appliance failures. Landlord email: landlord@example.com.',
      'Paint-Codes.md': '# Interior Paint\\nLiving Room: Sherwin Williams "Agreeable Gray" (Hex #D1CBC1). Bedroom: "Naval" blue.',
      'Appliance-Specs.md': '# HVAC\\nUses 16x20x1 MERV 8 filters. Replace every 90 days.'
    }
  }
];

const detailedProjects = [
  {
    track: 1,
    problem: "Generic AI hallucinates syllabus details and teaches methods different from the professor's.",
    overview: "Students often struggle when using generic LLMs for studying because the AI doesn't know the specific grading rubrics, syllabus constraints, or idiosyncratic methods taught by their professor. This project builds a hyper-local, context-aware academic assistant that refuses to answer questions outside of the provided course material.",
    rag: "Create an Obsidian vault containing 5-10 markdown files representing lecture notes, course syllabus, and assignment prompts. The AI must retrieve relevant chunks and cite the specific file when answering.",
    multimodal: "The user interface should allow uploading an image. The AI uses Gemini's Vision capabilities to extract the text/structure and explains it using only the principles found in the RAG notes.",
    tool: "Implement a tool-calling schema that can trigger an action like get_upcoming_deadlines(). This tool should return hardcoded JSON of deadlines."
  },
  {
    track: 2,
    problem: "Deciding what to cook based on fragmented leftover ingredients and specific household dietary restrictions.",
    overview: "Food waste is a major issue, and meal planning is tedious when balancing what's expiring in the fridge with complex household dietary restrictions. This application acts as a personal chef that generates recipes dynamically, ensuring no allergens are included.",
    rag: "The knowledge base consists of Markdown files detailing household profiles and family recipes. The RAG pipeline must retrieve the dietary restrictions *before* generation.",
    multimodal: "Users can upload a photo of an open fridge or pantry shelf. The system will prompt Gemini to identify visible ingredients and propose a safe meal.",
    tool: "Implement a calculate_nutrition(ingredients) tool to fetch calorie counts and macronutrient breakdowns."
  },
  {
    track: 3,
    problem: "Non-technical users need help fixing specific household or office equipment without sorting through generic web forums.",
    overview: "When the internet goes down or a printer breaks, generic AI advice is frustrating. This bot knows the exact model numbers, IP addresses, and idiosyncrasies of your specific local hardware setup.",
    rag: "Ingest Markdown versions of PDF manuals for specific devices alongside a 'Network_Topology.md' file.",
    multimodal: "Allow users to upload photos of blinking LED error sequences on a router or an obscure error screen. The AI translates the visual state into an error code.",
    tool: "Create a ping_device(ip_address) or check_internet_status() tool to alter troubleshooting advice."
  },
  {
    track: 4,
    problem: "Planning trips requires cross-referencing past preferences with new destinations, foreign languages, and currencies.",
    overview: "Travelers often have specific preferences that get lost when using standard travel apps. This app builds itineraries based on past behaviors and assists in real-time translation and cost conversion while abroad.",
    rag: "The Obsidian vault contains past travel journals, a list of personal preferences, and a database of 'Saved Places'.",
    multimodal: "Users upload a photo of a restaurant menu in a foreign language or a physical receipt. The model transcribes the text and translates items.",
    tool: "Integrate a convert_currency(amount, source_currency, target_currency) tool to display exact costs."
  },
  {
    track: 5,
    problem: "A workout assistant that designs routines based on personal injury history and available equipment.",
    overview: "Standard fitness apps fail when a user travels to a poorly-equipped hotel gym or has specific physical therapy constraints. This application acts as a physical therapist and personal trainer.",
    rag: "The knowledge base includes the user's physical therapy notes, injury history logs, and past workout performance.",
    multimodal: "The user takes a single wide-angle photo of a hotel gym. Gemini analyzes the image to identify available equipment.",
    tool: "Create a generate_workout_timer(rest_seconds) tool or mock Spotify playlist generator."
  },
  {
    track: 6,
    problem: "A financial tool that turns messy physical receipts into structured data and checks them against personal budget rules.",
    overview: "Freelancers lose hours manually entering receipts. This application automates the ingestion of physical financial documents and categorizes them according to tax laws and budget constraints.",
    rag: "The exocortex contains the user's monthly budget allocations, tax-deductible categories, and previous spending summaries.",
    multimodal: "Users upload photos of crumpled receipts. The model extracts Vendor Name, Date, Line Items, and Total Amount into JSON.",
    tool: "Implement an export_to_sheets(json_data) tool to push extracted data into a mock database."
  },
  {
    track: 7,
    problem: "A localized gardening bot that helps users keep specific indoor or balcony plants alive based on actual conditions.",
    overview: "Generic plant care advice kills plants because it ignores local conditions. This application tracks the exact state of your personal indoor garden and provides hyper-specific diagnosis.",
    rag: "Markdown logs of every plant owned by the user, repotting dates, soil types, and watering needs.",
    multimodal: "The user snaps a photo of a sick plant showing symptoms. The AI cross-references visual symptoms with plant species data.",
    tool: "Implement a check_local_weather(city) tool to proactively warn the user of bad weather."
  },
  {
    track: 8,
    problem: "An assistant for complex games that manages custom rules, lore, and complex board states.",
    overview: "Running a tabletop RPG requires tracking custom lore and homebrew rules. This application serves as the ultimate Game Master's screen.",
    rag: "The Obsidian vault is the Campaign Wiki containing session summaries, NPC notes, and house rules.",
    multimodal: "The user takes a picture of a battle map grid or rolled dice. The AI sums dice or assesses line-of-sight.",
    tool: "Implement a roll_dice(notation) tool or a generate_npc(location) tool."
  },
  {
    track: 9,
    problem: "A cultural exploration app tailored to Kathmandu's specific historical sites.",
    overview: "Standard map apps lack deep cultural context. This app acts as a digital historian providing nuanced explanations of local architecture and mythology.",
    rag: "Notes on local history, cultural significance of deities, festival schedules, and architectural terminology.",
    multimodal: "The user takes a picture of a temple strut or statue. The AI identifies the deity/style and retrieves mythology.",
    tool: "Integrate a get_walking_distance() tool or a tool fetching opening hours."
  },
  {
    track: 10,
    problem: "A digital \"house manual\" that helps manage repairs and keep track of appliance specifications.",
    overview: "Homeowners struggle to keep track of warranties and specs. This application digitizes the 'house manual' into an AI assistant.",
    rag: "Lease agreements, appliance serial numbers, paint codes, and previous repair logs.",
    multimodal: "The user uploads a photo of a leaky pipe or stripped screw. The AI identifies the specific part needed.",
    tool: "Implement an email_landlord(issue_summary, urgency) tool to draft and 'send' formal requests."
  }
];

function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

try {
  console.log("Switching to main branch...");
  execSync("git checkout main");

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const padNum = t.track.toString().padStart(2, "0");
    const branchName = "track-" + padNum + "-" + t.slug;
    console.log("\\nProcessing branch " + branchName + "...");

    try { execSync("git branch -D " + branchName); } catch(e) {}
    execSync("git checkout -b " + branchName);

    const vaultPath = path.join(repoPath, "sample-vault");
    cleanDir(vaultPath);
    for (const [filename, content] of Object.entries(t.vault)) {
      fs.writeFileSync(path.join(vaultPath, filename), content);
    }

    const prd = detailedProjects.find(p => p.track === t.track);
    const readmeContent = "# Track " + t.track + ": " + t.title + "\\n\\n" +
      "**The Problem / Concept**\\n" + prd.problem + "\\n\\n" +
      "## Project Overview & Objectives\\n" + prd.overview + "\\n\\n" +
      "If you select this track, your goal is to build a functional Minimum Viable Prototype (MVP) that seamlessly integrates a Node.js/Express backend with Google's Gemini API, utilizing Retrieval-Augmented Generation (RAG), multimodal vision, and autonomous tool calling.\\n\\n" +
      "---\\n\\n" +
      "## Detailed Requirements Document (PRD)\\n\\n" +
      "### 1. RAG (Obsidian) Core Requirement\\n" +
      "To prevent hallucination, the AI must be grounded in a specific, personal knowledge base. You will build this using Markdown files in Obsidian.\\n\\n" +
      "* **Knowledge Base Content**: " + prd.rag + "\\n" +
      "* **Starter Vault**: Check the `sample-vault/` directory in this branch for pre-populated mock data to test your pipeline immediately!\\n\\n" +
      "### 2. Multimodal (Vision) Stretch Goal\\n" +
      "AI is not just text. Modern products must perceive the world.\\n\\n" +
      "* **Vision Use Case**: " + prd.multimodal + "\\n\\n" +
      "### 3. Tool Calling Stretch Goal\\n" +
      "Agents need to take actions in the real world or fetch real-time data that isn't in their RAG database.\\n\\n" +
      "* **Tool Definition**: " + prd.tool + "\\n\\n" +
      "---\\n\\n" +
      "## Starter Kit Instructions\\n" +
      "This repository contains the Node/Express starter kit.\\n" +
      "1. Run `npm install`\\n" +
      "2. Copy `.env.example` to `.env` and add your Gemini API Key.\\n" +
      "3. Run `npm run dev`\\n";
    
    fs.writeFileSync(path.join(repoPath, "README.md"), readmeContent);

    execSync("git add .");
    execSync('git commit -m "Initialize Track ' + t.track + ' PRD and Seed Vault"');
  }

  execSync("git checkout main");
  console.log("\\nAll branches created successfully! Returned to main.");

} catch (error) {
  console.error("Error:", error.stdout ? error.stdout.toString() : error);
}
