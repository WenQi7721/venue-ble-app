import csv
import json
import time
import os
import subprocess


def read_csv(file_path):
    data = []
    with open(file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        print("Reading CSV file...")
        for row in csv_reader:
            data.append(row)
    print(f"Read {len(data)} records from CSV.")
    return data


def advertise(uuid, is_valid):
    manufacturer_data = f"{uuid}{'01' if is_valid else '00'}"
    manufacturer_data = manufacturer_data.encode('utf-8').hex()
    duration = 300000  # 300 seconds in milliseconds
    command = ['node', 'advertise.js', manufacturer_data, str(duration)]
    print(f"Running advertising command for UUID {uuid}...")
    subprocess.run(command, cwd=os.path.dirname(__file__))
    print(f"Advertising command completed for UUID {uuid}.")


if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(
        __file__))  # Go up one level from src
    input_file_path = os.path.join(base_dir, 'processed_tickets.csv')
    last_seen_data = set()

    print("Starting main loop of the ticket processing and advertising system...")
    while True:
        if os.path.exists(input_file_path):
            print(f"Checking for new data in {input_file_path}")
            current_data = set(tuple(d.items())
                               for d in read_csv(input_file_path))
            new_entries = current_data - last_seen_data
            if new_entries:
                print(
                    f"Found {len(new_entries)} new entries. Processing new entries...")
            for entry in new_entries:
                data = dict(entry)
                uuid = data['UUID']
                is_valid = data['is_valid'] == 'True'
                print(f"Advertising for UUID {uuid} with validity {is_valid}")
                advertise(uuid, is_valid)
            last_seen_data = current_data
        else:
            print(
                f"No file found at {input_file_path}, will check again in 10 seconds.")
        time.sleep(10)
