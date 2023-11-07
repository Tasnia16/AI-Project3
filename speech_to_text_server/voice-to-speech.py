from time import sleep
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import warnings
import requests
from selenium.webdriver.chrome.service import Service

warnings.simplefilter("ignore")

try:
    url = "https://dictation.io/speech"
    chrome_options = Options()
    chrome_options.headless = False
    chrome_options.add_experimental_option(
        'excludeSwitches', ['enable-logging'])
    chrome_options.add_argument('--log-level=3')
    chrome_options.add_argument("--use-fake-ui-for-media-stream")
    chrome_options.add_argument("--use-fake-device-for-media-stream")

    driver = webdriver.Chrome(options=chrome_options)
    driver.maximize_window()
    driver.get(url)

    try:
        driver.find_element(by=By.XPATH, value="/html/body/div[1]/div").click()
    except:
        pass

    sleep(15)

    driver.execute_script(
        'navigator.mediaDevices.getUserMedia({ audio: true })')
    sleep(1)

    clear_button_xpath = '/html/body/div[3]/section/div/div/div[2]/div/div[3]/div[2]/a[8]'
    driver.find_element(by=By.XPATH, value=clear_button_xpath).click()
    sleep(1)

    start_button_xpath = "/html/body/div[3]/section/div/div/div[2]/div/div[3]/div[1]/a"
    driver.find_element(by=By.XPATH, value=start_button_xpath).click()
    print("Microphone is turned on")

except Exception as e:
    print("Error"+e)

while True:
    sleep(2)
    text_element_xpath = '/html/body/div[3]/section/div/div/div[2]/div/div[2]'
    text = driver.find_element(by=By.XPATH, value=text_element_xpath).text
    if len(text) == 0:
        pass
    else:
        driver.find_element(by=By.XPATH, value=clear_button_xpath).click()
        text = text.strip()
        requests.post("http://localhost:5000/send_text", json={"text": text})
        output_file_path = "SpeechRecognition.txt"
        with open(output_file_path, "w") as file_write:
            file_write.write(text)
