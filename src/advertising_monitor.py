import csv
import json
import time
import os
import subprocess


def read_csv(file_path):
    data = []
    with open(file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            data.append(row)
    return data


def advertise(uuid, is_valid):
    manufacturer_data = f"{uuid}{'01' if is_valid else '00'}"
    manufacturer_data = manufacturer_data.encode('utf-8').hex()
    duration = 300000  # 300 seconds in milliseconds
    command = ['node', 'advertise.js', manufacturer_data, str(duration)]
    subprocess.run(command)


if __name__ == "__main__":
    input_file_path = 'processed_tickets.csv'
    last_seen_data = set()

    while True:
        if os.path.exists(input_file_path):
            current_data = set(tuple(d.items())
                               for d in read_csv(input_file_path))
            new_entries = current_data - last_seen_data
            for entry in new_entries:
                data = dict(entry)
                uuid = data['UUID']
                is_valid = data['is_valid'] == 'True'
                advertise(uuid, is_valid)
            last_seen_data = current_data
        time.sleep(10)
