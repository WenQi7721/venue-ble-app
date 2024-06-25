import csv
import json


def process_ticket(data):
    # Implement your data processing logic here
    return True


def process_csv(file_path):
    processed_data = []
    with open(file_path, mode='r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for row in csv_reader:
            data = {
                'localName': row['Local Name'],
                'uuid': row['UUID'],
                'manufacturerData': row['Manufacturer Data'],
                'rssi': row['RSSI']
            }
            is_valid = process_ticket(data)
            data['is_valid'] = is_valid
            processed_data.append(data)
    return processed_data


def write_processed_csv(file_path, processed_data):
    fieldnames = ['Local Name', 'UUID',
                  'Manufacturer Data', 'RSSI', 'is_valid']
    with open(file_path, mode='w', newline='') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        csv_writer.writeheader()
        csv_writer.writerows(processed_data)


if __name__ == "__main__":
    input_file_path = 'tickets.csv'
    output_file_path = 'processed_tickets.csv'
    processed_data = process_csv(input_file_path)
    write_processed_csv(output_file_path, processed_data)
    print(json.dumps(processed_data))
