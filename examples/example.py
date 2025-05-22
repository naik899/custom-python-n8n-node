import requests
import pandas as pd
import json

def fetch_time_series_data():
    """
    Fetch time series data from a public source and return it as JSON.
    """
    url = "https://datahub.io/core/global-temp/r/monthly.csv"  # Public source for global temperature data

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad status codes

        # Convert the CSV data to a pandas DataFrame
        data = pd.read_csv(pd.compat.StringIO(response.text))
        return data.to_json(orient='records')  # Return the data as JSON

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

if __name__ == "__main__":
    data = fetch_time_series_data()
    if data is not None:
        exit(data)  # Return the JSON data as the script's output
