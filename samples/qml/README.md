# Sample usage of Glean.js in a Qt/QML app

To run this sample, just run:

```bash
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

But first you need to build Glean.js for this to work.
On the root directory for this project run:

```bash
npm install
npm run build.qml
```

Or, in case you intent to continually make changes to Glean.js:

```bash
npm install
npm run dev.qml
```
