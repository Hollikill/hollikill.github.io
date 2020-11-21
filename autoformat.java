/*
*       HTML DOCUMENT AUTOFORMAT
*       a program by Hollister Harper Ream
*
*       The goal of this program is to shorten the process of writing html documents by creating a new file format and an easy way to clone segments of code.
*       It does this through a combination of three diffrent factors.
*
*       The first of these factor is the MAIN FILE FORMAT, created specifically for this program: .hfmt
*       A concise and easy way to save html documents, allowing you to save multiple html documents in one easily accessible area!
*
*       The second of these factors are ABBREVIATIONS.
*       Abbreviations are a simple to use way of including very similar segments of code into a small package, and making code easier on the eyes.
*       Abbreviations are denoted by using a double ampersand and then the name of the abbreviation, followed by another double ampersand.
*       For example: &&my first abbreviation&&
*       When the auto-formatter sees an abbreviations, it will check the 
*/

import java.util.*;
import java.io.*;

class AutoFormat {
    public static void main (String args[]) {
        //declare variable needed for general use
        Scanner file;
        Scanner in = new Scanner(System.in);

        //get filename
        String filename = in.nextLine();
        
        //open file
        try {
            file = new Scanner(new File(filename+".hfmt"));
        }
        catch (Exception e) {
            System.out.println("/// File opening failed! ///\n"+e);
            in.close();
            return;
        }

        //create a arraylist to store the data of the file
        ArrayList<Character> filedata = new ArrayList<Character>();

        try {
            while (file.hasNext()) {
                //add the data of the next line of the file to the overall string
                filedata.add(in.next().charAt(0));
            }
        }
        catch (Exception e) {
            System.out.println("/// File reading failed! ///\n"+e);
            in.close();
            return;
        }

        /*
        * Start scanning for the first file decleration and the start reading the data
        * Ex: @index
        */

        //Creates a scanner to read through the data by char, easily allowing for reading of bracketed section and subsequent progression
        FileWriter htmlWriter = null;
        File htmlDoc;

        //String in case we need to get longer sections of data
        String tempStr = new String();
        //int to store how many section of brackets we have entered and not yet exited, so that we don't get confused by the start and end brackets of each html document
        int bracketLevel = 0;

        for (int i=0;i<filedata.size();i++) {
            //get the next char in data, and save it to the array
            char c = filedata.get(i);

            //check for signal to start reading the name
            if (bracketLevel == 0 && c == '@') {
                bracketLevel++;
            }

            //get the name of the doc
            if (bracketLevel == 1 && c!=' ') {
                tempStr += c;
            }

            //enter the section and create a file for this html doc
            else if (bracketLevel == 1) {
                //move from getting filename
                bracketLevel++;

                //affim existance of directories

                /*try {
                    htmlDoc = new File(tempStr);
                }
                catch (Exception e) {
                    System.out.println("/// File opening failed! ///\n"+e);
                    in.close();
                    return;
                }
                //make sure to overwrite
                if (htmlDoc.exists()) {
                    htmlDoc.delete();
                }
                try {
                    //create file if it does not exist
                    htmlDoc.createNewFile();
                }
                catch (Exception e) {
                    System.out.println("/// File creation failed! ///\n"+e);
                    in.close();
                    return;
                }
                try {
                    //set the scanner to this file
                    htmlWriter = new FileWriter(htmlDoc);
                }
                catch (Exception e) {
                    System.out.println("/// Scanner assignment failed! ///\n"+e);
                    in.close();
                    return;
                }*/
            }
            if (bracketLevel == 2 && c=='}') {
                bracketLevel-=2;
            }
            else if (bracketLevel > 1) {
                if (c=='{') {
                    bracketLevel++;
                    try {
                        htmlWriter.write(c);
                    }
                    catch (Exception e) {
                        System.out.println("/// Write to file failed! ///\n"+e);
                        in.close();
                        return;
                    }
                }
                else if (c=='}') {
                    bracketLevel--;
                }

            }
        }

        //close input scanner
        in.close();
    }
}