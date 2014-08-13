<?php 
function custom_title () {
  return "Privacy Policy";
}

function rf_topbar () {
  return array (
    'url' => '/license/',
    'title' => 'Privacy Policy'
  );
}

if(!function_exists('rf_trackpage')) {
    function rf_trackpage () {
        return array (
            'name' => "",
            'opts' => array (
            )
        );
    }
}


require $_SERVER['DOCUMENT_ROOT']."/layout/header.php";
?>
<div class="container">
<div class="row">
<div class="col-md-12 content-start only-content">

<h3>Privacy Policy</h3>
<p>
At RazorFlow, we respect your privacy. We're committed to protecting it using every means we can. In this privacy policy, we inform you about how we use the information that we collect from you. Information here refers to two types of data that we collect - General Statistical Information and Personal Identifying Information.
</p>

<h3>Collection, Use and Disclosure of General Statistical Information</h3>
<p>
When you visit our web site, we gather certain general information, such as frequency of downloads, number of hits on our web site, and usage statistics with respect to our software products. This information is referred to throughout this policy as "General Statistical Information". We use and store this data only on a collective basis, in summary form, rather than on an individual basis. This data helps us to determine how and the extent to which certain parts of our web site and software are used. The stored General Statistical Information does not contain any Personal Identifying Information about you or any of our other users.
</p>

<h3>Collection and Use of Personal Identifying Information</h3>
<p>
In addition to collecting General Statistical Information, we may ask you to provide us with certain personal information, such as your name, street address and email address, to enable us to respond to your requests and needs. Information that can reasonably be used to identify you is referred to in this policy as "Personal Identifying Information".
</p>
<p>
For example, if you choose a service or transaction that requires payment, such as making a purchase online or through other means such as a purchase order, we will request Personal Identifying Information necessary for payment, invoicing, and/or shipping.
</p>
<p>
In addition, when you purchase a RazorFlow software product, we will also ask for product registration information, which includes the name of the product acquired, as well as your name, street address, and e-mail address. This Personal Identifying Information is kept on file and updated from time to time to fulfill our continuing obligations to you, such as providing notices of new versions and giving support by e-mail.
</p>
<p>
When you visit our web pages by clicking on a link in the RazorFlow software and choose to purchase a license, we gather certain Personal Identifying Information to facilitate your purchase and usage statistics to analyze, on a collective basis, how and the extent to which certain parts of the RazorFlow is used.
</p>
<p>
When you provide us Personal Identifying Information in an e-mail, fax or by telephone such as when you request technical and other types of support, we use the information to locate your records and provide you with answers to your questions.
</p>
<p>
Also, when you submit information to us in the context of a technical support inquiry, including sending the error files, sample data to reproduce the error, Personal Identifying Information may be attached to the information submitted.
</p>
<p>
Please note that you should be aware that the transmitting of the error files or sample data or other attachments may include confidential information which should be removed prior to the transmittal as we do not accept responsibility for the inadvertent subsequent disclosure of such confidential information. When you ask to be placed on one of our mailing lists, we will use your e-mail address to send you messages relevant to that list.
</p>

<h3>Disclosure of Personal Identifying Information</h3>
<p>
We may disclose your Personal Identifying Information to appropriate third parties to process transactions you initiate, including shipping products to you and invoicing for purchases made. Examples of such third parties are our order processing and fulfillment service providers and credit card processing companies. We may also disclose your Personal Identifying Information to third parties if we are required to do so by law, or if we believe that such action is necessary to:
</p>

<ol>
  <li>Comply with legal processes such as a search warrant, subpoena, or court order;</li>
  <li>Protect our rights and property; or</li>
  <li>Protect against misuse or unauthorized use of our web site and/or RazorFlow software products.</li>
</ol>

<p>We never loan, rent or sell your Personal Identifying Information to others.</p>
<h3>Cookies</h3>
<p>We may set and access cookies on your computer. A cookie is a small amount of data that is sent to your browser from a Web server and stored on your computer's hard drive. We use cookies in a limited way to track usage on our site. We gather information about site use by our visitors through cookie technology on an anonymous basis and analyze it at an aggregate level only. This enables us to continually improve our website to meet the needs of our users.</p>
<p>In addition, we may use temporary session cookies to track your progress through our order processing system, keeping track of information such as the contents of your shopping cart and address. These session cookies only exist for the duration of your browser session.</p>
<h3>Third Party Web Sites</h3>
<p>The RazorFlow web site may contain links to third-party web sites over which we have no control or responsibility regarding content, privacy policies, or practices. We suggest that you review the privacy policy applicable to any third party site that you visit. This privacy policy applies only to our own web site at www.razorflow.com. Please note that all on-line and telephone credit card orders for RazorFlow software products may be processed by a third party.</p>
<h3>Changes to Privacy Policy</h3>
<p>RazorFlow may amend this policy at any time by posting the amended terms on our web site. All amended terms will be automatically effective without further notice, 10 days after they are first posted.</p>


</div>
</div>
</div>
<?php
require $_SERVER['DOCUMENT_ROOT']."/layout/footer.php";
