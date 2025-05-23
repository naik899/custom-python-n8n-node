import requests
import pandas as pd
from io import StringIO
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
        data = pd.read_csv(StringIO(response.text))
        return data.to_json(orient='records')  # Return the data as JSON

    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching data: {e}")

# Directly call the function and return the result
fetch_time_series_data()