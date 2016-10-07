from subprocess import call
import time

# This path will change to external hdd to hold images
fred_ehdd = '/Users/fredhohman/Desktop/temp/'

# Define `timeout` for fail safe, don't want to fill up harddrive with screenshots!
num_secs = 20
num_mins = 0
num_hours = 0

timeout = time.time() + num_secs + 60*num_mins + 3600*num_hours # add time in seconds

if __name__ == '__main__':
	while True:
		date = time.strftime("%H-%M-%S_%m-%d-%y")
		call(['screencapture', fred_ehdd + str(date) + '.png'])
		time.sleep(1) # screenshot every ~1 second
		if time.time() > timeout:
			break
