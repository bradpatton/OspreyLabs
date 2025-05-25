#!/bin/bash

# Create secrets directory if it doesn't exist
mkdir -p secrets

# Function to prompt for secret value
prompt_secret() {
    local secret_name=$1
    local secret_file="secrets/${secret_name}.txt"
    
    # Check if secret file already exists
    if [ -f "$secret_file" ]; then
        read -p "Secret $secret_name already exists. Do you want to overwrite it? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    # Prompt for secret value
    read -sp "Enter $secret_name: " secret_value
    echo
    
    # Save secret to file
    echo -n "$secret_value" > "$secret_file"
    chmod 600 "$secret_file"
    echo "Secret $secret_name has been saved."
}

# Prompt for each secret
prompt_secret "openai_api_key"
prompt_secret "openai_assistant_id"
prompt_secret "admin_api_key"

echo "All secrets have been set up." 