#!/usr/bin/env nu
#set $env.UNIFI_API_KEY in nushell before running.
#using this to make sure we dont have any ip overlaps in the plan before omving forward. 

# Get devices on 10.0.1.0/24 subnet from UDM-Pro
def main [] {
  let api_key = $env.UNIFI_API_KEY
  
  if ($api_key | is-empty) {
    echo "Error: UNIFI_API_KEY environment variable not set"
    exit 1
  }
  
  # Get all devices (network equipment)
  echo "Getting network devices..."
  let devices = (http get 'https://10.0.1.1/proxy/network/api/s/default/stat/device' 
    --headers [X-API-KEY $api_key Accept 'application/json'] 
    --insecure |
    get data |
    select ip name mac |
    sort-by ip)
  
  echo $devices

}