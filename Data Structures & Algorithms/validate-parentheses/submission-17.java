class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for(int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (checkForPush(c)) {
                stack.push(c);
            } else { 
            
            if (stack.isEmpty()) return false;

            if (c == '}' && stack.peek() == '{') {
                stack.pop();
            } else if (c == ')' && stack.peek() == '(') {
                stack.pop();
            } else if (c == ']' && stack.peek() == '[') {
                stack.pop();
            } else {
                return false;
            }
            }
        }

        return stack.size() == 0;
    }

    public boolean checkForPush(char c) {
        return c == '{' || c == '(' || c == '[';
    }

    
}