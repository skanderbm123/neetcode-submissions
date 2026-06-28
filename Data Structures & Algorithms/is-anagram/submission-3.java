class Solution {
    public boolean isAnagram(String s, String t) {

        char[] fstring = s.toCharArray();
        char[] tstring = t.toCharArray();

        if(fstring.length != tstring.length) return false;

        Arrays.sort(fstring);
        Arrays.sort(tstring);

        for(int i=0;i<fstring.length;i++) {
            if(fstring[i]  == tstring[i]){
                continue;
            } else {
                return false;
            }
        }

        return true;

    }
}
