export async function myText() {
    const div = document.createElement('div')
    const text = document.createElement('h1');
    text.innerText = ('hello');
    div.append(text);
}
