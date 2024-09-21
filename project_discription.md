# Frame Me Web App

## Project Notation and Plan

For the “Frame Me” app, several interconnected databases will be created to support the business model and ensure a seamless user experience:

### Databases

1. **Client Database**
   - **Purpose**: To store client information such as name, address, email, and payment details.
   - **Content**:
     - User personal information
     - Address details
     - Email contacts
     - Payment information

2. **Gallery Database**
   - **Purpose**: To house the main content of the web app, including all artwork images and descriptions.
   - **Content**:
     - Artwork images
     - Descriptions of each artwork
     - Artist information
     - Availability status

3. **Purchases Database**
   - **Purpose**: To record details of purchased artworks, including the date of purchase and the information of the client who made the purchase.
   - **Content**:
     - Purchased artwork details
     - Purchase date
     - Client information associated with the purchase

4. **Print Shops Database**
   - **Purpose**: To maintain information about partnered print shops that users can access after purchasing artwork.
   - **Content**:
     - Shop names
     - Addresses
     - Contact information

5. **Framing Database**
   - **Purpose**: Similar to the Print Shops Database, this will store details of framing partners.
   - **Content**:
     - Frame shop names
     - Addresses
     - Contact information

6. **Auction Database**
   - **Purpose**: This database will be used during auctions to store exclusive images and related data.
   - **Content**:
     - Exclusive auction images
     - Bidding data linked to the client information
     - Auction price history for each bid

   The Auction Database will follow the same patterns as the other databases, with one key exception: every time a bid is placed, the app will be reloaded. The bid data will be stored in a **Bid Price Database**, connected to the Client Database, and the final purchase will be stored in the Purchases Database, just like any other sold artwork.

### App Flow and User Experience

1. **User Registration**
   - Upon registration, user data will populate the Client Database with basic information.

2. **Gallery Browsing**
   - Registered users can browse the gallery content (from the Gallery Database), explore various artworks, and add their favorite pieces to the cart.

3. **Checkout Process**
   - During checkout, the remaining client information, including payment details and address, will be captured and stored in the Client Database.

4. **Purchase Management**
   - Purchased artworks will be moved from the Gallery Database to the Purchases Database and subsequently removed from public view on the app to maintain exclusivity.

5. **Print and Frame Services**
   - After completing a purchase, users will have the option to use print and frame services. Print and framing shop details will be pulled from their respective databases based on the user's selection.

6. **Auction Feature**
   - During an auction, exclusive artwork will be stored in the Auction Database.
   - Each time a bid is made, the app will reload to reflect the latest price.
   - Bid data will be stored in the **Bid Price Database**, linked to the Client Database.
   - Once the auction ends, the winning bid will be treated like a regular purchase and stored in the Purchases Database.

7. **Subscription and Newsletters**
   - Users can subscribe by clicking the subscribe button, which will automatically enroll them in newsletters and promotional emails.

### Summary

- **Client Database**: Manages user information.
- **Gallery Database**: Stores and manages all artworks.
- **Purchases Database**: Tracks sold artworks and client purchases.
- **Print Shops Database**: Connects users to print services.
- **Framing Database**: Connects users to framing services.
- **Auction Database**: Manages exclusive artworks during auctions and stores bidding data.

The app aims to provide a seamless experience from registration to purchase, printing, framing, and auction participation, ensuring exclusivity and convenience at every step.
