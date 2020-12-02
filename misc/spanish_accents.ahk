#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.
#SingleInstance, force

KEYS=haeioun1/ ; Define the keys to use with the accent hotkey
Coordmode,ToolTip,Screen ; Set tooptip to use screen coords
letters:=["á","Á","é","É","í","Í","ó","Ó","ú","Ú","ñ","Ñ","¡","¡","¿","¿"] ; add accented letters
Gui, Help:New, +Resize +MinSize300x100, Key Conversions Help ; create help window
Gui, Help:Font, s30, Sitka Text ; set font
Gui, Help:Add, Text,, a --> á	A --> Á`ne --> é	E --> É`ni --> í	I --> Í`no --> ó	O --> Ó`nu --> ú	U --> Ú`nn --> ñ	N --> Ñ`n1 --> ¡	! --> ¡`n/ --> ¿	? --> ¿
Gui, Help:Font, s10 caaaaaa, Sitka Text ; set font
Gui, Help:Add, Link, -E0x200, Code adapted from a post by <a href="https://autohotkey.com/board/topic/544-accent-hotkey-script/?p=461213">maestrith</a>`nsource code <a href="https://hollikill.net/misc/spanish_accents.ahk">here</a>

RETURN

ACCENT:
key:=GetKeyState("CAPSLOCK","T") ? "+" a_thishotkey : a_thishotkey ; if capslock is on, add a '+' to the input, always store in variable 'key'
gosub,off ; turn off hotkeys
if (instr(a_thishotkey, "h")) {
	gosub,help
}
else {
	send, % convert(key)
}
tooltip, ; disable the tooptip
return

on:
loop,parse,keys
{
	hotkey,%a_loopfield%,ACCENT,ON ; adds hotkeys for all of the letters in keys
	hotkey,+%a_loopfield%,ACCENT,ON ; allows pressing while using other keys
}
return

off:
loop,parse,keys
{
	hotkey,%a_loopfield%,ACCENT,off ; removes hotkeys for all of the letters in keys
	hotkey,+%a_loopfield%,ACCENT,off ; disallows pressing while using other keys
}
return

~`::
return
~+`::
return

^`::
tooltip,type accent`npress [ h ] for help,10,10 ; display short help
accent() ; do thing
return

help::
Gui, Help:Show
return

accent(){
	global
	current:=0
	gosub,on
	exit
}

convert(letter) {
	global
	if (instr(letter, "e")) {
		current = 1
	}
	else if (instr(letter, "i")) {
		current = 2
	}
	else if (instr(letter, "o")) {
		current = 3
	}
	else if (instr(letter, "u")) {
		current = 4
	}
	else if (instr(letter, "n")) {
		current = 5
	}
	else if (instr(letter, "1")) {
		current = 6
	}
	else if (instr(letter, "/")) {
		current = 7
	}
	if (instr(key, "+")) {
		return % letters[2*current +2]
	}
	return % letters[2*current +1]
}

esc::
reload ; restart the program
return