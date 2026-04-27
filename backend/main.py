from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from simulator import simulate_election


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "ElectraMind backend running"}


@app.post("/simulate")
def simulate(data: dict):
    candidates = data.get("candidates", ["A", "B", "C", "D"])
    voters = data.get("voters", 1000)


    system = data.get("system", "fptp")
    return simulate_election(candidates, voters, system)



@app.post("/ask")
def ask_ai(data: dict):
    question = data.get("question", "").lower()


    if "ranked" in question:
        answer = "Ranked Choice Voting হলো এমন একটি পদ্ধতি যেখানে ভোটাররা প্রার্থীদের পছন্দের ক্রম অনুযায়ী rank করে।"
    elif "fptp" in question or "first" in question:
        answer = "FPTP বা First-Past-The-Post পদ্ধতিতে যে প্রার্থী সবচেয়ে বেশি ভোট পায়, সে জয়ী হয়।"
    elif "turnout" in question:
        answer = "Voter turnout মানে মোট যোগ্য ভোটারের মধ্যে কত শতাংশ মানুষ ভোট দিয়েছে।"
    elif "winner" in question or "win" in question:
        answer = "Winner নির্ধারণ করা হয় যে প্রার্থী সবচেয়ে বেশি ভোট পেয়েছে তার ভিত্তিতে।"
    else:
        answer = "Election process বুঝতে registration, voting, counting এবং result announcement—এই ধাপগুলো গুরুত্বপূর্ণ।"


    return {"answer": answer}


from datetime import datetime
import os, json
from google.oauth2 import service_account
from googleapiclient.discovery import build

SPREADSHEET_ID = os.getenv("GOOGLE_SHEET_ID")
GOOGLE_SERVICE_ACCOUNT_JSON = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")

def get_sheets_service():
    service_account_info = json.loads(GOOGLE_SERVICE_ACCOUNT_JSON)

    credentials = service_account.Credentials.from_service_account_info(
        service_account_info,
        scopes=["https://www.googleapis.com/auth/spreadsheets"],
    )

    return build("sheets", "v4", credentials=credentials)


@app.post("/export-to-sheets")
def export_to_sheets(data: dict):
    try:
        service = get_sheets_service()

        row = [
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            data.get("email", ""),
            ", ".join(data.get("candidates", [])),
            data.get("voters", ""),
            data.get("systemName", ""),
            data.get("winner", ""),
            data.get("turnout", ""),
            data.get("totalVotes", ""),
        ]

        body = {"values": [row]}

        service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range="Sheet1!A:H",
            valueInputOption="USER_ENTERED",
            body=body,
        ).execute()

        return {"success": True}

    except Exception as e:
        return {"success": False, "error": str(e)}