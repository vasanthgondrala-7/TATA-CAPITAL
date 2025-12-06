# 🏦 GenAI: Agentic Orchestration for End-to-End Personal Loan Sales 🤖
### **Tata Capital BFSI Challenge Submission: Master Agent Digital Sales Assistant**

![Challenge Badge](https://img.shields.io/badge/Challenge-Tata%20Capital%20BFSI%20AI-blue)
![Status Badge](https://img.shields.io/badge/Status-Complete%20(E2E%20Flow)-brightgreen)
![Architecture Badge](https://img.shields.io/badge/Architecture-Master%2FWorker%20Agents-orange)

## 🎯 Value Proposition

This solution transforms the non-banking financial services (NBFC) loan process from a static chatbot interface into a dynamic, **human-like digital sales executive**. By employing a **Master-Worker Agentic AI framework**, the system handles the complete end-to-end sales lifecycle—from initial customer engagement and personalized negotiation to complex credit evaluation and sanction letter generation.

**Goal:** Simulate a highly persuasive, multi-step sales process using AI to drive successful loan conversion rates.

---

## 🏗️ Agentic AI Architecture (The Core Solution)

The system is built on a **single Master Agent orchestrating multiple, specialized Worker Agents** to complete the loan process, eliminating the limitations of a linear, single-turn chatbot approach.

### 🧠 Master Agent (The Orchestrator)
The **Master Agent (Agentic AI Controller)** serves as the central brain, managing the entire conversation flow and making high-level decisions on delegation.

* **Role:** Manages conversation flow and coordinates the overall workflow.
* **Key Action:** Hands over tasks to the appropriate Worker Agent based on the current stage of the loan process.

### 🛠️ Worker Agents (The Specialists)
These agents execute specific, complex, and high-value tasks, allowing the Master Agent to focus on customer experience.

| Worker Agent | Primary Function | Core Responsibilities |
| :--- | :--- | :--- |
| **1. Sales Agent** | Negotiation & Upselling | Negotiates loan terms (amount, tenure, interest) and maintains a persuasive, human-like dialogue. |
| **2. Verification Agent** | KYC Compliance | Confirms customer KYC details (phone, address) against a simulated **dummy CRM server**. |
| **3. Underwriting Agent** | Risk Assessment & Credit Decision | Fetches credit score from a **mock credit bureau API** and validates eligibility against defined business logic. |
| **4. Sanction Letter Generator** | Final Output | Generates a PDF sanction letter upon successful validation of all conditions. |


---

## ⚖️ Business Logic & System Integration

To prove the solution's enterprise readiness, the Underwriting Agent implements critical, defined business logic and integrates with mock infrastructure:

### 1. Credit Underwriting Decision Logic

The Underwriting Agent follows strict, conditional rules based on credit score and pre-approved limits (all based on a 900-point scale for the dummy credit score):

* ✅ **Instant Approval:** If the loan amount is **≤ Pre-approved limit**, the loan is approved instantly.
* ⚠️ **Conditional Approval (Edge Case Handling):** If the loan amount is **> Pre-approved limit but ≤ 2x Pre-approved limit**, it requires the user to **upload a salary slip** for further review, and the expected EMI must be **≤ 50% of the salary**.
* ❌ **Rejection:** The application is rejected if the loan amount is **> 2x Pre-approved limit** OR the fetched **credit score is < 700**.

### 2. Mock Systems Integration

We assume the following systems are mocked to achieve an end-to-end flow:
* **CRM Server:** Mock server for KYC data.
* **Offer Mart Server:** Mock server for pre-approved loan offers.
* **Credit Bureau API:** Mock API to fetch credit scores.
* **Synthetic Data:** Used to create dummy data for at least **10 customers** with name, age, city, current loan details, and credit score.

---

## 💻 Implementation Details

### Tech Stack
* **Language:** `[e.g., Python 3.10+]`
* **LLM Framework:** `[e.g., LangChain / AutoGen / CrewAI]`
* **Model Provider:** `[e.g., Gemini API / OpenAI GPT-4 / Anthropic Claude]`
* **Frontend/Demo:** `[e.g., Streamlit / Gradio / Chainlit]`
* **PDF Generation:** `[e.g., ReportLab / FPDF]`

### Submission & Deliverables
* **Core Deliverable:** 5-Slide PPT showcasing the end-to-end journey from the initial chat to the sanction letter generation.
* **Repository Link:** `https://github.com/vasanthgondrala-7/TATA-CAPITAL`

### How to Run Locally

```bash
# Clone the repository
git clone [https://github.com/vasanthgondrala-7/TATA-CAPITAL](https://github.com/vasanthgondrala-7/TATA-CAPITAL)
cd TATA-CAPITAL

# Install dependencies
pip install -r requirements.txt

# Set your API Key
export GEMINI_API_KEY="YOUR_API_KEY"  # or OPENAI_API_KEY

# Run the application
python app.py
