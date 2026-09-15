
import subprocess
import sys

def render_letters_toilet(text: str, font: str = "smisome1", font_dir: str = "/usr/share/figlet/fonts"):
    for char in text:
        if char == " ":
            print("\n")  # Add spacing for word separators
            continue
        
        cmd = ["toilet", "-f", font, "-d", font_dir, char]
        
        try:
            print("<pre>")
            subprocess.run(cmd, check=True)
            print("</pre>")
        except FileNotFoundError:
            print("Error: 'toilet' command not found. Install it via 'sudo apt install toilet'.", file=sys.stderr)
            sys.exit(1)
        except subprocess.CalledProcessError as e:
            print(f"Error rendering character '{char}': {e}", file=sys.stderr)

if __name__ == "__main__":
    print('<div id="hacking" class="word">')
    render_letters_toilet("hacking")
    print("</div>")
    print('<div id="farm" class="word">')
    render_letters_toilet("farm")
    print("</div>")
