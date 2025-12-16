file_path = r"c:\Users\amerz\Desktop\avds--ag\avds Figma UI\src\contexts\FeaturesContext.tsx"

with open(file_path, 'rb') as f:
    content = f.read()
    # Search for "Ak" followed by some bytes
    start = content.find(b"Ak")
    if start != -1:
        snippet = content[start:start+20]
        print(f"Bytes: {snippet.hex(' ')}")
        try:
            print(f"Decoded (utf-8): {snippet.decode('utf-8')}")
        except:
            print("Decoded (utf-8): Failed")
        try:
            print(f"Decoded (cp1252): {snippet.decode('cp1252')}")
        except:
            print("Decoded (cp1252): Failed")
    else:
        print("Could not find 'Ak'")
