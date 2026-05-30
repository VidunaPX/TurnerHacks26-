import os
import json
import re
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()



def upload_file(file_path: str) -> str:
    try:
        with open(file_path, "rb") as f:
            file = client.files.create(
                file=f,
                purpose="assistants"
            )

        print(f" Uploaded file ID: {file.id}")
        return file.id

    except Exception as e:
        print("File upload failed:", str(e))
        raise



def extract_patient_data(file_id: str):
    try:
        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_file",
                            "file_id": file_id
                        },
                        {
                            "type": "input_text",
                            "text": """
Extract structured patient medical data.

Return ONLY valid JSON in this format:

{
  "patient": {
    "id": "string",
    "name": "string",
    "age": number,
    "bloodType": "string",
    "conditions": [],
    "medications": [],
    "allergies": [],
    "timeline": [
      {
        "date": "YYYY-MM-DD",
        "event": "string",
        "desc": "string"
      }
    ],
    "logs": [
      {
        "date": "YYYY-MM-DD",
        "metric": "string",
        "value": "string"
      }
    ]
  }
}

Rules:
- Return ONLY JSON
- No markdown
- No explanation
- Use null if unknown
"""
                        }
                    ]
                }
            ]
        )

        return response.output_text

    except Exception as e:
        print("Extraction failed:", str(e))
        raise



def safe_json_parse(text: str):
    cleaned = re.sub(r"```json|```", "", text).strip()

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)

        if match:
            return json.loads(match.group())

        print("Failed to parse JSON output")
        print("RAW OUTPUT:\n", text)
        raise



def clean_output(raw_text: str):
    data = safe_json_parse(raw_text)

    patient = data.get("patient", {})


    for t in patient.get("timeline", []):
        if "notes" in t:
            t["desc"] = t.pop("notes")


    for l in patient.get("logs", []):
        if "type" in l:
            l["metric"] = l.pop("type")

    return {"patient": patient}


def save_output_file(data: dict):
    os.makedirs("outputs", exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = f"outputs/patient_{timestamp}.json"

    with open(file_path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nOutput saved to: {file_path}")
    return file_path



def run(file_path: str):
    print("\n Starting MedThread extraction pipeline...\n")


    file_id = upload_file(file_path)


    print("\nExtracting patient data...")
    raw = extract_patient_data(file_id)


    print("\n Cleaning + validating output...")
    cleaned = clean_output(raw)


    print("\nFINAL OUTPUT:\n")
    print(json.dumps(cleaned, indent=2, ensure_ascii=False))


    save_output_file(cleaned)



if __name__ == "__main__":
    run("alex_morgan_medical_report.txt")