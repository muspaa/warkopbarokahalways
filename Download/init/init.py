import asyncio
import urllib.parse
import os
from telethon import TelegramClient, functions, types

# --- CONFIGURATION ---
API_HASH = 'fb06985ea797ac51aaa1e6d1168ceaaa'
API_ID = '35898257'

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

async def get_init_data():
    clear()
    # Input for bot username added here
    print("\033[36m" + "="*60)
    print("           TELEGRAM INIT DATA EXTRACTOR")
    print("="*60 + "\033[0m")
    
    bot_input = input("\033[32m[?] Enter Bot Username (e.g. LitecoinGeneratorBot): \033[0m").strip()
    if bot_input.startswith('@'):
        BOT_USERNAME = bot_input[1:]
    else:
        BOT_USERNAME = bot_input

    client = TelegramClient('session_auth', API_ID, API_HASH)
    
    await client.start()
    clear()
    print("\033[32m[+] Successfully Logged In!\033[0m")

    try:
        print(f"\033[34m[*] Fetching Bot Info for @{BOT_USERNAME}...\033[0m")
        bot = await client.get_input_entity(BOT_USERNAME)
        
        # Get full user info to find the WebApp URL in the menu button
        full_user_request = await client(functions.users.GetFullUserRequest(id=bot))
        bot_info = full_user_request.full_user.bot_info
        
        # Extract URL from the menu button automatically
        target_url = None
        if bot_info and bot_info.menu_button:
            if hasattr(bot_info.menu_button, 'url'):
                target_url = bot_info.menu_button.url
                print(f"\033[32m[+] Auto-detected URL: {target_url}\033[0m")

        # Fallback if detection fails
        if not target_url:
            target_url = 'https://claimltc.net/'
            print(f"\033[33m[*] Using fallback URL: {target_url}\033[0m")

        print(f"\033[34m[*] Requesting WebView...\033[0m")
        
        # Use the classic RequestWebViewRequest which is more reliable for these bots
        result = await client(functions.messages.RequestWebViewRequest(
            peer=bot,
            bot=bot,
            platform='android',
            from_bot_menu=True,
            url=target_url
        ))

        # Parse the result
        parsed_url = urllib.parse.urlparse(result.url)
        fragment = parsed_url.fragment
        query_params = urllib.parse.parse_qs(fragment)
        init_data = query_params.get('tgWebAppData', [None])[0]

        if init_data:
            print("\n\033[33m" + "="*60)
            print(" YOUR INIT DATA (QUERY ID):")
            print("="*60 + "\033[0m")
            print(f"\033[37m{init_data}\033[0m")
            print("\033[33m" + "="*60 + "\033[0m\n")
            
            with open("init_data.txt", "w") as f:
                f.write(init_data)
            print("\033[32m[!] Saved to init_data.txt\033[0m")
        else:
            print("\033[31m[!] Error: Query data not found in response.\033[0m")

    except Exception as e:
        print(f"\033[31m[!] An error occurred: {e}\033[0m")
    finally:
        await client.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(get_init_data())
    except KeyboardInterrupt:
        pass
